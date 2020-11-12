const { expect, assert } = require("chai")
const { ethers } = require('hardhat')

describe("UserRatings App", () => {

    let UserRatings
    let Daniel, Christian, Evan

    beforeEach(async () => {
        [Daniel, Christian, Evan] = await ethers.getSigners()
        const c = await ethers.getContractFactory("UserRatings");
        UserRatings = await c.deploy()
    })

    it("should register a user", async () =>  {
        await UserRatings.connect(Daniel).register("Daniel")

        const userAccount = await UserRatings.users(0)
        const numberOfUsers = await UserRatings.userCount()

        assert.equal(userAccount, Daniel.address)
        assert.equal(numberOfUsers.toString(), 1)
    })

    it("should not allow a user to register twice", async () => {

        try {
            await UserRatings.connect(Daniel).register("Daniel")
            await UserRatings.connect(Daniel).register("Daniel")
        } catch (err) {
            assert.equal(err.message.indexOf('User is already registered') > -1, true)
            return
        }

        assert.equal('This should be reached', true)
    })

    it("should rate a user", async () => {
        await UserRatings.connect(Daniel).register("Daniel")
        await UserRatings.connect(Christian).register("Christian")
        await UserRatings.connect(Evan).register("Evan")

        await UserRatings.connect(Daniel).rateUser(Christian.address, 2)
        await UserRatings.connect(Daniel).rateUser(Evan.address, 2)

        const ratingsForChristian = await UserRatings.connect(Christian).ratingsFromOthersCount()
        assert.equal(ratingsForChristian.toString(), 1)

        const ratingsFromDaniel = await UserRatings.connect(Daniel).ratingsForOthersCount()
        assert.equal(ratingsFromDaniel.toString(), 2)

        const [ratee, userRating, timestamp] = await UserRatings.connect(Christian).ratingFromUser(Daniel.address, Christian.address)
        assert.equal(userRating.toString(), 2)

        const userRatingTimestamp = await UserRatings.connect(Christian).ratingFromUserTime(Daniel.address, Christian.address)

        const ts = new Date(userRatingTimestamp * 1000).toString()

        assert.equal(ts.indexOf('GMT-') > -1, true)
    })
})
