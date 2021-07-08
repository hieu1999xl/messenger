import React, { Component } from "react";
import ReactLoading from "react-loading";
import { withRouter } from "react-router-dom";
import { myFirebase, myFirestore } from "../../Config/MyFirebase";
// import images from "../Themes/Images";
import WelcomeBoard from "../WelcomeBoard/WelcomeBoard";
// import "./Main.css";
import "../../App.css";
import ChatBoard from "./../ChatBoard/ChatBoard";
import { AppString } from "./../Const";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isOpenDialogConfirmLogout: false,
      currentPeerUser: null,
    };
    this.currentUserId = localStorage.getItem(AppString.ID);
    this.currentUserAvatar = localStorage.getItem(AppString.PHOTO_URL);
    this.currentUserNickname = localStorage.getItem(AppString.NICKNAME);
    this.listUser = [];
  }

  componentDidMount() {
    this.checkLogin();
  }

  checkLogin = () => {
    if (!localStorage.getItem(AppString.ID)) {
      this.setState({ isLoading: false }, () => {
        this.props.history.push("/");
      });
    } else {
      this.getListUser();
    }
  };

  getListUser = async () => {
    const result = await myFirestore.collection(AppString.NODE_USERS).get();
    if (result.docs.length > 0) {
      this.listUser = [...result.docs];
      this.setState({ isLoading: false });
    }
  };

  onLogoutClick = () => {
    this.setState({
      isOpenDialogConfirmLogout: true,
    });
  };

  doLogout = () => {
    this.setState({ isLoading: true });
    myFirebase
      .auth()
      .signOut()
      .then(() => {
        this.setState({ isLoading: false }, () => {
          localStorage.clear();
          this.props.showToast(1, "Logout success");
          this.props.history.push("/");
        });
      })
      .catch(function (err) {
        this.setState({ isLoading: false });
        this.props.showToast(0, err.message);
      });
  };

  hideDialogConfirmLogout = () => {
    this.setState({
      isOpenDialogConfirmLogout: false,
    });
  };

  onProfileClick = () => {
    this.props.history.push("/profile");
  };

  renderListUser = () => {
    if (this.listUser.length > 0) {
      let viewListUser = [];
      this.listUser.forEach((item, index) => {
        if (item.data().id !== this.currentUserId) {
          viewListUser.push(
            <div
              key={index}
              className="msg"
              onClick={() => {
                this.setState({ currentPeerUser: item.data() });
              }}
            >
              <img className="msg-profile" src={item.data().photoUrl} alt="" />
              <div className="msg-detail">
                <div className="msg-username">{item.data().nickname}</div>
                <div className="msg-content">
                  <span className="msg-message">{`About me: ${
                    item.data().aboutMe ? item.data().aboutMe : "Not available"
                  }`}</span>
                  <span className="msg-date">20m</span>
                </div>
              </div>
            </div>
          );
        }
      });
      return viewListUser;
    } else {
      return null;
    }
  };

  render() {
    return (
      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="logo">
            <svg viewBox="0 0 513 513" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M256.025.05C117.67-2.678 3.184 107.038.025 245.383a240.703 240.703 0 0085.333 182.613v73.387c0 5.891 4.776 10.667 10.667 10.667a10.67 10.67 0 005.653-1.621l59.456-37.141a264.142 264.142 0 0094.891 17.429c138.355 2.728 252.841-106.988 256-245.333C508.866 107.038 394.38-2.678 256.025.05z" />
              <path
                d="M330.518 131.099l-213.825 130.08c-7.387 4.494-5.74 15.711 2.656 17.97l72.009 19.374a9.88 9.88 0 007.703-1.094l32.882-20.003-10.113 37.136a9.88 9.88 0 001.083 7.704l38.561 63.826c4.488 7.427 15.726 5.936 18.003-2.425l65.764-241.49c2.337-8.582-7.092-15.72-14.723-11.078zM266.44 356.177l-24.415-40.411 15.544-57.074c2.336-8.581-7.093-15.719-14.723-11.078l-50.536 30.744-45.592-12.266L319.616 160.91 266.44 356.177z"
                fill="#fff"
              />
            </svg>
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="user-settings">
            <div className="dark-light">
              <svg
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            </div>
            <div className="settings" onClick={this.onLogoutClick}>
              <svg viewBox="0 0 512.00533 512" fill="#e0e3e6" xmlns="http://www.w3.org/2000/svg">
                <path d="m320 277.335938c-11.796875 0-21.332031 9.558593-21.332031 21.332031v85.335937c0 11.753906-9.558594 21.332032-21.335938 21.332032h-64v-320c0-18.21875-11.605469-34.496094-29.054687-40.554688l-6.316406-2.113281h99.371093c11.777344 0 21.335938 9.578125 21.335938 21.335937v64c0 11.773438 9.535156 21.332032 21.332031 21.332032s21.332031-9.558594 21.332031-21.332032v-64c0-35.285156-28.714843-63.99999975-64-63.99999975h-229.332031c-.8125 0-1.492188.36328175-2.28125.46874975-1.027344-.085937-2.007812-.46874975-3.050781-.46874975-23.53125 0-42.667969 19.13281275-42.667969 42.66406275v384c0 18.21875 11.605469 34.496093 29.054688 40.554687l128.386718 42.796875c4.351563 1.34375 8.679688 1.984375 13.226563 1.984375 23.53125 0 42.664062-19.136718 42.664062-42.667968v-21.332032h64c35.285157 0 64-28.714844 64-64v-85.335937c0-11.773438-9.535156-21.332031-21.332031-21.332031zm0 0" />
                <path d="m505.75 198.253906-85.335938-85.332031c-6.097656-6.101563-15.273437-7.9375-23.25-4.632813-7.957031 3.308594-13.164062 11.09375-13.164062 19.714844v64h-85.332031c-11.777344 0-21.335938 9.554688-21.335938 21.332032 0 11.777343 9.558594 21.332031 21.335938 21.332031h85.332031v64c0 8.621093 5.207031 16.40625 13.164062 19.714843 7.976563 3.304688 17.152344 1.46875 23.25-4.628906l85.335938-85.335937c8.339844-8.339844 8.339844-21.824219 0-30.164063zm0 0" />
              </svg>
            </div>
            <svg
              onClick={this.onProfileClick}
              className="user-profile"
              version="1.1"
              x="0px"
              y="0px"
              viewBox="0 0 45.532 45.532"
              fill="#e0e3e6"
            >
              <g>
                <path
                  d="M22.766,0.001C10.194,0.001,0,10.193,0,22.766s10.193,22.765,22.766,22.765c12.574,0,22.766-10.192,22.766-22.765
		S35.34,0.001,22.766,0.001z M22.766,6.808c4.16,0,7.531,3.372,7.531,7.53c0,4.159-3.371,7.53-7.531,7.53
		c-4.158,0-7.529-3.371-7.529-7.53C15.237,10.18,18.608,6.808,22.766,6.808z M22.761,39.579c-4.149,0-7.949-1.511-10.88-4.012
		c-0.714-0.609-1.126-1.502-1.126-2.439c0-4.217,3.413-7.592,7.631-7.592h8.762c4.219,0,7.619,3.375,7.619,7.592
		c0,0.938-0.41,1.829-1.125,2.438C30.712,38.068,26.911,39.579,22.761,39.579z"
                />
              </g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
            </svg>
          </div>
        </div>
        {/* Body */}
        <div className="wrapper">
          <div className="conversation-area">
            {this.renderListUser()}
            <button className="add"></button>
            <div className="overlay"></div>
          </div>
          <div className="chat-area">
            {this.state.currentPeerUser ? (
              <ChatBoard currentPeerUser={this.state.currentPeerUser} showToast={this.props.showToast} />
            ) : (
              <WelcomeBoard currentUserNickname={this.currentUserNickname} currentUserAvatar={this.currentUserAvatar} />
            )}
          </div>
          {this.state.currentPeerUser ? (
            <div className="detail-area">
              <div className="detail-area-header">
                <div className="msg-profile group">
                  <svg
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="{2}"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="css-i6dzq1"
                  >
                    <path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2zM12 22v-6.5" />
                    <path d="M22 8.5l-10 7-10-7" />
                    <path d="M2 15.5l10-7 10 7M12 2v6.5" />
                  </svg>
                </div>
                <div className="detail-title">CodePen Group</div>
                <div className="detail-subtitle">Created by Aysenur, 1 May 2020</div>
                <div className="detail-buttons">
                  <button className="detail-button">
                    <svg
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="{0}"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-phone"
                    >
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    Call Group
                  </button>
                  <button className="detail-button">
                    <svg
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="{0}"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-video"
                    >
                      <path d="M23 7l-7 5 7 5V7z" />
                      <rect x="{1}" y="{5}" width="{15}" height="{14}" rx="{2}" ry="{2}" />
                    </svg>
                    Video Chat
                  </button>
                </div>
              </div>
              <div className="detail-changes">
                <input type="text" placeholder="Search in Conversation" />
                <div className="detail-change">
                  Change Color
                  <div className="colors">
                    <div className="color blue selected" data-color="blue" />
                    <div className="color purple" data-color="purple" />
                    <div className="color green" data-color="green" />
                    <div className="color orange" data-color="orange" />
                  </div>
                </div>
                <div className="detail-change">
                  Change Emoji
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="{2}"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-thumbs-up"
                  >
                    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                  </svg>
                </div>
              </div>
              <div className="detail-photos">
                <div className="detail-photo-title">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="{2}"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-image"
                  >
                    <rect x="{3}" y="{3}" width="{18}" height="{18}" rx="{2}" ry="{2}" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  Shared photos
                </div>
                <div className="detail-photo-grid">
                  <img src="https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2168&q=80" />
                  <img src="https://images.unsplash.com/photo-1516085216930-c93a002a8b01?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80" />
                  <img src="https://images.unsplash.com/photo-1458819714733-e5ab3d536722?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=933&q=80" />
                  <img src="https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2287&q=80" />
                  <img src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2247&q=80" />
                  <img src="https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1300&q=80" />
                  <img src="https://images.unsplash.com/photo-1560393464-5c69a73c5770?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1301&q=80" />
                  <img src="https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2249&q=80" />
                  <img src="https://images.unsplash.com/photo-1481349518771-20055b2a7b24?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2309&q=80" />
                  <img src="https://images.unsplash.com/photo-1473170611423-22489201d919?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2251&q=80" />
                  <img src="https://images.unsplash.com/photo-1579613832111-ac7dfcc7723f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80" />
                  <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2189&q=80" />
                </div>
                <div className="view-more">View More</div>
              </div>
              <a href="https://twitter.com/AysnrTrkk" className="follow-me" target="_blank">
                <span className="follow-text">
                  <svg
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="{2}"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="css-i6dzq1"
                  >
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                  Follow me on Twitter
                </span>
                <span className="developer">
                  <img src="https://pbs.twimg.com/profile_images/1253782473953157124/x56UURmt_400x400.jpg" />
                  Aysenur Turk — @AysnrTrkk
                </span>
              </a>
            </div>
          ) : (
            <WelcomeBoard currentUserNickname={this.currentUserNickname} currentUserAvatar={this.currentUserAvatar} />
          )}
        </div>

        {/* Dialog confirm */}
        {this.state.isOpenDialogConfirmLogout ? (
          <div className="viewCoverScreen">{this.renderDialogConfirmLogout()}</div>
        ) : null}
        {/* Loading */}
        {this.state.isLoading ? (
          <div className="viewLoading">
            <ReactLoading type={"spin"} color={"#203152"} height={"3%"} width={"3%"} />
          </div>
        ) : null}
      </div>
    );
  }

  renderDialogConfirmLogout = () => {
    return (
      <div>
        <div className="viewWrapTextDialogConfirmLogout">
          <span className="titleDialogConfirmLogout">Are you sure to logout?</span>
        </div>
        <div className="viewWrapButtonDialogConfirmLogout">
          <button className="btnYes" onClick={this.doLogout}>
            YES
          </button>
          <button className="btnNo" onClick={this.hideDialogConfirmLogout}>
            CANCEL
          </button>
        </div>
      </div>
    );
  };
}

export default withRouter(Main);
