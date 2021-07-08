import moment from "moment";
import React, { Component } from "react";
import ReactLoading from "react-loading";
import "react-toastify/dist/ReactToastify.css";
import { myFirestore, myStorage } from "../../Config/MyFirebase";
import images from "../Themes/Images";
import "./ChatBoard.css";
import { AppString } from "./../Const";
import logo from "../../logo.svg";
import ami from "../../images/ami-dam.gif";
import ami1 from "../../images/ami1.gif";
import ami2 from "../../images/ami2.gif";
import ami3 from "../../images/ami3.gif";
import ami4 from "../../images/ami4.gif";
import ami5 from "../../images/ami5.gif";
import ami6 from "../../images/ami6.gif";
import ami7 from "../../images/ami7.gif";
import ami8 from "../../images/ami8.gif";
import ami9 from "../../images/ami9.gif";

export default class ChatBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isShowSticker: false,
      inputValue: "",
    };
    this.currentUserId = localStorage.getItem(AppString.ID);
    this.currentUserAvatar = localStorage.getItem(AppString.PHOTO_URL);
    this.currentUserNickname = localStorage.getItem(AppString.NICKNAME);
    this.listMessage = [];
    this.currentPeerUser = this.props.currentPeerUser;
    this.groupChatId = null;
    this.removeListener = null;
    this.currentPhotoFile = null;
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  componentDidMount() {
    // For first render, it's not go through componentWillReceiveProps
    this.getListHistory();
  }

  componentWillUnmount() {
    if (this.removeListener) {
      this.removeListener();
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.currentPeerUser) {
      this.currentPeerUser = newProps.currentPeerUser;
      this.getListHistory();
    }
  }

  getListHistory = () => {
    if (this.removeListener) {
      this.removeListener();
    }
    this.listMessage.length = 0;
    this.setState({ isLoading: true });
    if (this.hashString(this.currentUserId) <= this.hashString(this.currentPeerUser.id)) {
      this.groupChatId = `${this.currentUserId}-${this.currentPeerUser.id}`;
    } else {
      this.groupChatId = `${this.currentPeerUser.id}-${this.currentUserId}`;
    }

    // Get history and listen new data added
    this.removeListener = myFirestore
      .collection(AppString.NODE_MESSAGES)
      .doc(this.groupChatId)
      .collection(this.groupChatId)
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === AppString.DOC_ADDED) {
              this.listMessage.push(change.doc.data());
            }
          });
          this.setState({ isLoading: false });
        },
        (err) => {
          this.props.showToast(0, err.toString());
        }
      );
  };

  openListSticker = () => {
    this.setState({ isShowSticker: !this.state.isShowSticker });
  };

  onSendMessage = (content, type) => {
    if (this.state.isShowSticker && type === 2) {
      this.setState({ isShowSticker: false });
    }

    if (content.trim() === "") {
      return;
    }

    const timestamp = moment().valueOf().toString();

    const itemMessage = {
      idFrom: this.currentUserId,
      idTo: this.currentPeerUser.id,
      timestamp: timestamp,
      content: content.trim(),
      type: type,
    };

    myFirestore
      .collection(AppString.NODE_MESSAGES)
      .doc(this.groupChatId)
      .collection(this.groupChatId)
      .doc(timestamp)
      .set(itemMessage)
      .then(() => {
        this.setState({ inputValue: "" });
      })
      .catch((err) => {
        this.props.showToast(0, err.toString());
      });
  };

  onChoosePhoto = (event) => {
    if (event.target.files && event.target.files[0]) {
      this.setState({ isLoading: true });
      this.currentPhotoFile = event.target.files[0];
      // Check this file is an image?
      const prefixFiletype = event.target.files[0].type.toString();
      if (prefixFiletype.indexOf(AppString.PREFIX_IMAGE) === 0) {
        this.uploadPhoto();
      } else {
        this.setState({ isLoading: false });
        this.props.showToast(0, "This file is not an image");
      }
    } else {
      this.setState({ isLoading: false });
    }
  };

  uploadPhoto = () => {
    if (this.currentPhotoFile) {
      const timestamp = moment().valueOf().toString();

      const uploadTask = myStorage.ref().child(timestamp).put(this.currentPhotoFile);

      uploadTask.on(
        AppString.UPLOAD_CHANGED,
        null,
        (err) => {
          this.setState({ isLoading: false });
          this.props.showToast(0, err.message);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            this.setState({ isLoading: false });
            this.onSendMessage(downloadURL, 1);
          });
        }
      );
    } else {
      this.setState({ isLoading: false });
      this.props.showToast(0, "File is null");
    }
  };

  onKeyboardPress = (event) => {
    if (event.key === "Enter") {
      this.onSendMessage(this.state.inputValue, 0);
    }
  };

  scrollToBottom = () => {
    if (this.messagesEnd) {
      this.messagesEnd.scrollIntoView({});
    }
  };

  render() {
    return (
      <div className="chat-area-main">
        {/* Header */}
        {/* <div className="headerChatBoard">
          <img className="msg-profile" src={this.currentPeerUser.photoUrl} alt="icon avatar" />
          <span className="textHeaderChatBoard">{this.currentPeerUser.nickname}</span>
        </div> */}

        {/* List message */}
        <div>
          {this.renderListMessage()}
          <div
            style={{ float: "left", clear: "both" }}
            ref={(el) => {
              this.messagesEnd = el;
            }}
          />
        </div>

        {/* Stickers */}
        {this.state.isShowSticker ? this.renderStickers() : null}

        {/* View bottom */}
        <div className="chat-area-footer">
          <input
            ref={(el) => {
              this.refInput = el;
            }}
            accept="image/*"
            className="viewInputGallery"
            type="file"
            onChange={this.onChoosePhoto}
          />
          <svg
            onClick={() => this.refInput.click()}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-image"
          >
            <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>

          <svg fill="#c1c7cd" onClick={this.openListSticker} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <g>
              <g>
                <path d="m196.866 222.794c4.142 0 7.5-3.357 7.5-7.5 0-5.062 4.118-9.179 9.179-9.179s9.178 4.117 9.178 9.179c0 4.143 3.358 7.5 7.5 7.5s7.5-3.357 7.5-7.5c0-13.332-10.846-24.179-24.178-24.179s-24.179 10.847-24.179 24.179c0 4.143 3.358 7.5 7.5 7.5z" />
                <path d="m289.276 215.294c0-5.062 4.117-9.179 9.179-9.179s9.179 4.117 9.179 9.179c0 4.143 3.357 7.5 7.5 7.5s7.5-3.357 7.5-7.5c0-13.332-10.847-24.179-24.179-24.179s-24.179 10.847-24.179 24.179c0 4.143 3.357 7.5 7.5 7.5s7.5-3.357 7.5-7.5z" />
                <path d="m184.323 304.505c25.641 46.768 117.717 46.763 143.354 0 1.991-3.632.661-8.19-2.971-10.182-3.634-1.993-8.192-.661-10.182 2.971-19.887 36.272-97.116 36.357-117.048 0-1.991-3.631-6.548-4.964-10.182-2.971-3.632 1.991-4.962 6.55-2.971 10.182z" />
                <path d="m439.107 37.77h-366.214c-40.193 0-72.893 32.7-72.893 72.893v290.674c0 40.193 32.7 72.894 72.893 72.894h319.02c9.978 0 19.357-3.886 26.413-10.94l82.733-82.733c7.055-7.056 10.94-16.436 10.94-26.413v-243.48c.001-40.195-32.698-72.895-72.892-72.895zm-27.329 410.853v-64.173c0-5.758 4.685-10.441 10.442-10.441h64.172zm85.222-94.479c0 1.658-.197 3.284-.547 4.865h-74.232c-14.029 0-25.442 11.413-25.442 25.441v74.233c-1.581.35-3.207.547-4.865.547h-319.021c-31.922 0-57.893-25.97-57.893-57.893v-290.674c0-31.923 25.971-57.893 57.893-57.893h366.214c31.922 0 57.893 25.97 57.893 57.893z" />
                <path d="m395.423 266.325c-4.104-.521-7.863 2.386-8.387 6.494-3.723 29.273-16.718 55.774-37.581 76.637-51.53 51.531-135.378 51.533-186.911-.001-20.92-20.92-33.925-47.497-37.608-76.857-.516-4.11-4.261-7.029-8.375-6.508-4.11.516-7.023 4.265-6.508 8.375 4.102 32.699 18.586 62.298 41.886 85.598 57.374 57.373 150.738 57.386 208.125.001 23.235-23.236 37.708-52.75 41.854-85.352.521-4.109-2.387-7.864-6.495-8.387z" />
                <path d="m360.062 151.937c-57.381-57.379-150.745-57.378-208.125.001-23.145 23.146-37.603 52.539-41.81 85.001-.532 4.107 2.366 7.869 6.474 8.401 4.105.538 7.869-2.366 8.402-6.474 3.777-29.148 16.758-55.54 37.54-76.321 51.533-51.533 135.382-51.532 186.911-.001 20.871 20.87 33.867 47.38 37.585 76.664.481 3.789 3.71 6.557 7.431 6.557.315 0 .634-.02.954-.061 4.109-.521 7.018-4.275 6.496-8.385-4.14-32.614-18.614-62.138-41.858-85.382z" />
              </g>
            </g>
          </svg>
          <input
            type="text"
            value={this.state.inputValue}
            onChange={(event) => {
              this.setState({ inputValue: event.target.value });
            }}
            onKeyPress={this.onKeyboardPress}
            placeholder="Type something here..."
          />
          <svg
            fill="#c1c7cd"
            onClick={() => this.onSendMessage(this.state.inputValue, 0)}
            enable-background="new 0 0 512 512"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path d="m499.394 237.364-471.982-187.41c-16.306-6.474-32.489 9.83-25.907 26.149l56.465 139.955c2.051 5.083 6.09 9.102 11.175 11.121l72.581 28.82-72.581 28.82c-5.086 2.019-9.125 6.038-11.175 11.121l-56.466 139.955c-6.569 16.286 9.566 32.637 25.907 26.149l471.982-187.41c16.774-6.661 16.844-30.582.001-37.27zm-443.304 170.173 35.75-88.611 111.55-44.292c16.771-6.66 16.841-30.582 0-37.27l-111.55-44.293-35.75-88.611 381.641 151.538z" />
            </g>
          </svg>
        </div>

        {/* Loading */}
        {this.state.isLoading ? (
          <div className="viewLoading">
            <ReactLoading type={"spin"} color={"#203152"} height={"3%"} width={"3%"} />
          </div>
        ) : null}
      </div>
    );
  }

  renderListMessage = () => {
    if (this.listMessage.length > 0) {
      let viewListMessage = [];
      this.listMessage.forEach((item, index) => {
        if (item.idFrom === this.currentUserId) {
          // Item right (my message)
          if (item.type === 0) {
            viewListMessage.push(
              <div className="chat-msg owner">
                <div key={item.timestamp} className="chat-msg-content">
                  <div className="chat-msg-text">{item.content}</div>
                </div>
              </div>
            );
          } else if (item.type === 1) {
            viewListMessage.push(
              <div className="chat-msg owner">
                <div key={item.timestamp} className="chat-msg-content">
                  <img className="chat-msg-text" src={item.content} alt="content message" />
                </div>
              </div>
            );
          } else {
            viewListMessage.push(
              <div className="chat-msg owner">
                <div key={item.timestamp} className="chat-msg-content">
                  <img className="chat-msg-text" src={this.getGifImage(item.content)} alt="content message" />
                </div>
              </div>
            );
          }
        } else {
          // Item left (peer message)
          if (item.type === 0) {
            viewListMessage.push(
              <div key={item.timestamp} className="chat-msg">
                <div className="chat-msg-profile">
                  {this.isLastMessageLeft(index) ? (
                    <img src={this.currentPeerUser.photoUrl} alt="avatar" className="chat-msg-img" />
                  ) : (
                    <div className="viewPaddingLeft" />
                  )}
                  <div className="chat-msg-date">
                    {this.isLastMessageLeft(index) ? <span>{moment(Number(item.timestamp)).format("ll")}</span> : null}
                  </div>
                </div>
                <div className="chat-msg-content">
                  <div className="chat-msg-text">{item.content}</div>
                </div>
              </div>
            );
          } else if (item.type === 1) {
            viewListMessage.push(
              <div key={item.timestamp} className="chat-msg">
                <div className="chat-msg-profile">
                  {this.isLastMessageLeft(index) ? (
                    <img src={this.currentPeerUser.photoUrl} alt="avatar" className="chat-msg-img" />
                  ) : (
                    <div className="viewPaddingLeft" />
                  )}
                  <div className="chat-msg-date">
                    {this.isLastMessageLeft(index) ? <span>{moment(Number(item.timestamp)).format("ll")}</span> : null}
                  </div>
                </div>
                <div className="chat-msg-content">
                  <img className="chat-msg-text" src={item.content} alt="content message" />
                </div>
              </div>
            );
          } else {
            viewListMessage.push(
              <div key={item.timestamp} className="chat-msg">
                <div className="chat-msg-profile">
                  {this.isLastMessageLeft(index) ? (
                    <img src={this.currentPeerUser.photoUrl} alt="avatar" className="chat-msg-img" />
                  ) : (
                    <div className="viewPaddingLeft" />
                  )}
                  <div className="chat-msg-date">
                    {this.isLastMessageLeft(index) ? <span>{moment(Number(item.timestamp)).format("ll")}</span> : null}
                  </div>
                </div>
                <div className="chat-msg-content" key={item.timestamp}>
                  <img className="chat-msg-text" src={this.getGifImage(item.content)} alt="content message" />
                </div>
              </div>
            );
          }
        }
      });
      return viewListMessage;
    } else {
      return (
        <div className="viewWrapSayHi">
          <span className="textSayHi">Say hi to new friend</span>
          <img className="imgWaveHand" src={images.ic_wave_hand} alt="wave hand" />
        </div>
      );
    }
  };

  renderStickers = () => {
    return (
      <div className="viewStickers">
        <img className="imgSticker" src={ami} alt="sticker" onClick={() => this.onSendMessage("ami", 2)} />
        <img className="imgSticker" src={ami2} alt="sticker" onClick={() => this.onSendMessage("ami2", 2)} />
        <img className="imgSticker" src={ami3} alt="sticker" onClick={() => this.onSendMessage("ami3", 2)} />
        <img className="imgSticker" src={ami4} alt="sticker" onClick={() => this.onSendMessage("ami4", 2)} />
        <img className="imgSticker" src={ami5} alt="sticker" onClick={() => this.onSendMessage("ami5", 2)} />
        <img className="imgSticker" src={ami6} alt="sticker" onClick={() => this.onSendMessage("ami6", 2)} />
        <img className="imgSticker" src={ami7} alt="sticker" onClick={() => this.onSendMessage("ami7", 2)} />
        <img className="imgSticker" src={ami8} alt="sticker" onClick={() => this.onSendMessage("ami8", 2)} />
        <img className="imgSticker" src={ami9} alt="sticker" onClick={() => this.onSendMessage("ami9", 2)} />
      </div>
    );
  };

  hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash += Math.pow(str.charCodeAt(i) * 31, str.length - i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };

  getGifImage = (value) => {
    switch (value) {
      case "ami":
        return ami;
      case "ami2":
        return ami2;
      case "ami3":
        return ami3;
      case "ami4":
        return ami4;
      case "ami5":
        return ami5;
      case "ami6":
        return ami6;
      case "mimi7":
        return ami7;
      case "ami8":
        return ami8;
      case "ami9":
        return ami9;
      default:
        return null;
    }
  };

  isLastMessageLeft(index) {
    if (
      (index + 1 < this.listMessage.length && this.listMessage[index + 1].idFrom === this.currentUserId) ||
      index === this.listMessage.length - 1
    ) {
      return true;
    } else {
      return false;
    }
  }

  isLastMessageRight(index) {
    if (
      (index + 1 < this.listMessage.length && this.listMessage[index + 1].idFrom !== this.currentUserId) ||
      index === this.listMessage.length - 1
    ) {
      return true;
    } else {
      return false;
    }
  }
}
