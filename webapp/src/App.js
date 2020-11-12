import React, { Component } from 'react'
import logo from './eth-logo-black.svg'
import './App.css'
import { MetaMaskButton, Link, Image, Icon } from 'rimble-ui'
import { Heading, Text, Modal, Flex, Box, Loader, Card } from "rimble-ui"
import ConnectionBanner from '@rimble/connection-banner'
import connector from './lib/connect'
import Contracts from './deployed-contracts/contracts.json'
import {
    Form,
    Input,
    Select,
    Field,
    Button,
    Checkbox,
    Radio
} from "rimble-ui"


class App extends Component {

    constructor(props) {
        super(props)

        this.usersAdded = {}

        this.state = {
            account: "",
            hasProvider: false,
            userName: "",
            users: [],
            rate_name: "",
            rate: 0,

            usersThatRatedMe: [],
            usersRatedByMe: [],
            usersRatedBySelectedUser: [],
        }
    }

    async componentDidMount() {
        try {

            const [api, ok] = await connector().connect()

            this.setState({hasProvider: ok})

            if (! ok) {
                // if we don't have a provider (MetaMask), we have a banner
                // showing in the header to direct users to download MetaMask
                return
            }

            // account event listeners
            {
                api.onAccountDisconnected = () => {
                    this.setState({account: null})
                }

                api.onAccountChanged = async account => {
                    this.setState({account: account || null})

                    if (! account) {
                        return
                    }

                    this.registerEventListeners(account)

                    try {
                        // only registered users will be able to request this
                        const usersRatedByMe = await this.getUsersRatedBy(this.state.account)
                        this.setState({usersRatedByMe})

                        const usersThatRatedMe = await this.getUserRatings()
                        this.setState({usersThatRatedMe})
                    } catch (err) {
                        this.setState({usersRatedByMe: []})
                    }

                }
            }

            this.api = api

            // since we have a provider, we'll see if we
            // already have an account connected
            {
                const accounts = await this.api.ethers.listAccounts()

                if (accounts.length > 0) {
                    this.setState({account: accounts[0]})

                    this.registerEventListeners(accounts[0])

                    try {
                        // only registered users can make this call
                        const usersRatedByMe = await this.getUsersRatedBy(this.state.account)
                        this.setState({usersRatedByMe})

                        const usersThatRatedMe = await this.getUserRatings()
                        this.setState({usersThatRatedMe})
                    } catch (err) {
                        this.setState({usersRatedByMe: []})
                    }
                }
            }

            // fetch all users
            // if this were production code, we'd have to paginate these results
            // to avoid fetching too many users in once transaction
            {
                const users = await this.getAllUsers()

                for (let i = 0; i < users.length; i++) {
                    const userAccount = await this.api.UserRatings.users(i)
                    const user = await this.api.UserRatings.registeredUsers(userAccount)

                    if (this.usersAdded[userAccount]) {
                        continue
                    }

                    this.usersAdded[userAccount] = true

                    this.setState({users: [...this.state.users, {name: user.name, account: user.account}]})
                }

            }

        } catch(err) {
            console.error(err)
        }

    }

    registerEventListeners = account => {
        // from, to, amount, event

        this.api.UserRatings.on("UserRated", async (rater, ratee, rating) => {

            const usersRatedByMe = await this.getUsersRatedBy(this.state.account)
            this.setState({usersRatedByMe})

            alert("User Rating has been saved to the blockchain.")
        })

        this.api.UserRatings.on("UserRegistered", (from, to, event) => {

            alert("User has been registered to the blockchain.")

            const {name, user} = event.args

            if (this.usersAdded[user]) {
                return
            }

            // this event seems to fire on page restart,
            // so we'll make sure we haven't already
            // added this user to the list of users

            this.usersAdded[user] = true
            this.setState({users: [...this.state.users, {name, account: user}]})
        })
    }

    handleNameChange = evt => {
        const { name, value } = evt.target

        this.setState({
            [name]: value
        })
    }

    handleRatingChange = evt => {
        const { name, value } = evt.target

        this.setState({
            rate: value
        })
    }

    getAllUsers = async () => {
        const userCount = await this.api.UserRatings.connect(this.api.ethers.getSigner()).userCount()

        const users = []

        for (let i = 0; i < userCount; i++) {
            const userAccount = await this.api.UserRatings.users(i)
            const user = await this.api.UserRatings.registeredUsers(userAccount)

            users.push({name: user.name, account: user.account})
        }

        return users
    }

    submitRating = async () => {
        const p = prompt("If you are sure type out the name of the user you are rating exactly as it appears.")

        // cancelled
        if (! p) {
            return
        }

        if (p !== this.state.rate_name) {

            alert("I'm sorry that name doesn't match.")
            return
        }

        if (! this.state.rate_account) {
            alert("Missing rate account")
            return
        }

        if (! this.state.rate) {
            alert("Missing rating")
            return
        }

        try {
            const res = await this.api.UserRatings
                                .connect(this.api.ethers.getSigner())
                                .rateUser(this.state.rate_account, this.state.rate)

            alert("Your rating has been sent to the blockchain. You should get confirmation of success in about 10-30 seconds.")
        } catch (err) {
            if (err.data && err.data.message.indexOf('You have already rated this user') > -1) {
                alert("You have already rated this user")
            }
        }
    }

    // get my user ratings
    getUserRatings = async () => {
        const users = await this.getAllUsers()

        const filteredUsers = []

        for (let i = 0; i < users.length; i++) {
            const u = users[i]

            const user = await this.api.UserRatings
                                   .connect(this.api.ethers.getSigner())
                                   .ratingFromUser(u.account, this.state.account)

            if (! user) continue
            // ratings should always be > 0
            if (! user[1]) continue

            u.rating = user[1]
            u.ratingTimestamp = new Date(user[2] * 1000).toString()

            filteredUsers.push(u)
        }

        return filteredUsers
    }

    getUsersRatedBy = async byAccount => {

        const users = await this.getAllUsers()

        const filteredUsers = []

        for (let i = 0; i < users.length; i++) {
            const u = users[i]

            const user = await this.api.UserRatings
                                   .connect(this.api.ethers.getSigner())
                                   .ratingFromUser(byAccount, u.account)

            if (! user) continue
            // ratings should always be > 0
            if (! user[1]) continue

            u.rating = user[1]
            u.ratingTimestamp = new Date(user[2] * 1000).toString()

            filteredUsers.push(u)
        }

        return filteredUsers
    }

    registerUser = async () => {
        if (! this.state.userName) {
            alert('A name is required')
            return
        }

        await this.api.UserRatings
                  .connect(this.api.ethers.getSigner())
                  .register(this.state.userName)

        alert("Registration request received. In about 10-30 seconds you'll see your name added to the list.")
    }

    reviewUser = async user => {

        try {
            const usersRatedBySelectedUser = await this.getUsersRatedBy(user.account)

            this.setState({rate_account: user.account, rate_name: user.name})
            this.setState({usersRatedBySelectedUser})
        } catch (err) {
            alert("You cannot review this user. Are you registered?")
        }
    }

    dappConnect = async () => {

        // TODO: implement wallet connect
        if (! this.state.hasProvider) {
            window.alert('Please install MetaMask')
            return
        }

        const [account] = await window.ethereum.request({ method: "eth_requestAccounts" })

        if (! account) {
            return
        }

        this.setState({account})
    }

    render() {
        const users = this.state.users.map(u => {
            return (<div className="App-list-item" key={u.account} onClick={() => this.reviewUser(u)}>
                <div className="App-user-name">
                    {u.name}
                </div>
                <div className="App-user-account">
                    {u.account}
                </div>
            </div>)
        })

        const usersRatedByMe = this.state.usersRatedByMe.map(u => {
            return (<div className="App-list-item" key={u.account}>
                <div className="App-user-name">
                    {u.name}
                </div>
                <div className="App-user-account">
                    {u.account}
                </div>
                <div className="App-user-rating">
                    {u.rating}
                </div>

                <div className="App-user-ratingTimestamp">
                    {u.ratingTimestamp}
                </div>
            </div>)
        })

        const usersThatRatedMe = this.state.usersThatRatedMe.map(u => {
            return (<div className="App-list-item" key={u.account}>
                <div className="App-user-name">
                    {u.name}
                </div>
                <div className="App-user-account">
                    {u.account}
                </div>
                <div className="App-user-rating">
                    {u.rating}
                </div>

                <div className="App-user-ratingTimestamp">
                    {u.ratingTimestamp}
                </div>
            </div>)
        })

        const usersRatedBySelectedUser = this.state.usersRatedBySelectedUser.map(u => {
            return (<div className="App-list-item" key={u.account}>
                <div className="App-user-name">
                    {u.name}
                </div>
                <div className="App-user-account">
                    {u.account}
                </div>
                <div className="App-user-rating">
                    {u.rating}
                </div>

                <div className="App-user-ratingTimestamp">
                    {u.ratingTimestamp}
                </div>
            </div>)
        })

        const connect = this.state.account
            ? <div className="App-account">{this.state.account}</div>
            : <MetaMaskButton.Outline onClick={this.dappConnect}>Connect with MetaMask</MetaMaskButton.Outline>

        return (
            <div className="App">
                <div className={"App-metamaskBanner " + (this.state.hasProvider ? 'hide' : 'show')}>
                    <ConnectionBanner
                        onWeb3Fallback={true}
                    />
                </div>
                <header className="App-header">
                    <nav className="App-nav">
                        <div className="App-nav_left">
                            <div className="App-logoWrap">
                                <a className="" href="/">
                                    <img src={logo} className="App-logo" alt="logo" />
                                </a>
                            </div>
                            <div className="App-siteTitle">
                                <a className="" href="/">DApp Starter</a>
                            </div>
                        </div>
                        <div className="App-nav_right">
                            {connect}
                        </div>
                    </nav>
                </header>
                <main className="App-main">
                    <div className="App-main-left">
                        <div className={"App-registrationForm " + (this.usersAdded[this.state.account] ? 'hide' : 'show')}>
                            <h2>Register</h2>
                            <Box width={[1, 1, 1]} px={3}>
                                <Field label="Name" width={1}>
                                    <Input type="text" required onChange={this.handleNameChange} name="userName" value={this.name} width={1} />
                                </Field>
                            </Box>
                            <Box width={[1, 1, 1]} px={3}>
                                <Field label="Account 0x" width={1}>
                                    <Input type="text" disabled required value={this.state.account} width={1} />
                                </Field>
                            </Box>
                            <Box width={[1, 1, 1]} px={3}>
                                <Button onClick={this.registerUser}>Register</Button>
                            </Box>

                        </div>

                        <div className="App-ratings-form">

                            <h2>Rate a User</h2>
                            <Box width={[1, 1, 1]} px={3}>
                                <Field label="Name" width={1}>
                                    <Input type="text" disabled required name="rate_name" value={this.state.rate_name} width={1} />
                                </Field>
                            </Box>
                            <Box width={[1, 1, 1]} px={3}>
                                <Field label="Rating - 1-5" width={1}>
                                    <Input type="number" required min="1" max="5" name="rate" onChange={this.handleRatingChange} width={1} />
                                </Field>
                            </Box>
                            <Box width={[1, 1, 1]} px={3}>
                                <Button onClick={this.submitRating}>Submit</Button>
                            </Box>

                            <div className="App-main-right">
                                <h2>Users Ratings</h2>
                                <div className="App-userList">
                                    {usersRatedBySelectedUser}
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="App-main-right">
                        <div className="App-userListWrap">
                            <h2>Users</h2>
                            <div className="App-userList">
                                {users}
                            </div>
                        </div>

                        <div className="App-usersThatRatedMe">
                            <h2>Users That Rated Me</h2>
                            <div className="App-userList">
                                {usersThatRatedMe}
                            </div>
                        </div>

                        <div className="App-usersRatedByMe">
                            <h2>Users Rated By Me</h2>
                            <div className="App-userList">
                                {usersRatedByMe}
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        );
    }
}

export default App;
