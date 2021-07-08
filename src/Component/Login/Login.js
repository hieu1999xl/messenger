import React, { Component } from "react";
import firebase from "firebase";
import ReactLoading from "react-loading";
import { withRouter } from "react-router-dom";
import { myFirebase, myFirestore } from "../../Config/MyFirebase";
import "./Login.css";
import { AppString } from "./../Const";

class Login extends Component {
  constructor(props) {
    super(props);
    this.provider = new firebase.auth.GoogleAuthProvider();
    this.state = {
      // loading khi render component là trrue
      isLoading: true,
    };
  }
  componentDidMount() {
    // check hàm login trước khi render component
    this.checkLogin();
  }
  checkLogin = () => {
    if (localStorage.getItem(AppString.ID)) {
      this.setState({ isLoading: false }, () => {
        this.setState({ isLoading: false });
        this.props.showToast(1, "Login success");
        this.props.history.push("/main");
      });
    } else {
      this.setState({ isLoading: false });
    }
  };
  onLoginPress = () => {
    this.setState({ isLoading: true });
    myFirebase
      .auth()
      .signInWithPopup(this.provider)
      .then(async (result) => {
        let user = result.user;
        if (user) {
          const result = await myFirestore.collection(AppString.NODE_USERS).where(AppString.ID, "==", user.uid).get();
          if (result.docs.length === 0) {
            // Set new data since this is a new user
            myFirestore
              .collection("users")
              .doc(user.uid)
              .set({
                id: user.uid,
                nickname: user.displayName,
                aboutMe: "",
                photoUrl: user.photoURL,
              })
              .then((data) => {
                // Write user info to local
                localStorage.setItem(AppString.ID, user.uid);
                localStorage.setItem(AppString.NICKNAME, user.displayName);
                localStorage.setItem(AppString.PHOTO_URL, user.photoURL);
                this.setState({ isLoading: false }, () => {
                  this.props.showToast(1, "Đăng nhập thành công");
                  this.props.history.push("/main");
                });
              });
          } else {
            // Write user info to local
            localStorage.setItem(AppString.ID, result.docs[0].data().id);
            localStorage.setItem(AppString.NICKNAME, result.docs[0].data().photoUrl);
            localStorage.setItem(AppString.ABOUT_ME, result.docs[0].data().aboutMe);
            this.setState({ isLoading: false }, () => {
              this.props.showToast(1, "Đăng nhập thành công");
              this.props.history.push("/main");
            });
          }
        } else {
          this.props.showToast(0, "Thông tin tài khoản không hợp lê");
        }
      })
      .catch((err) => {
        this.props.showToast(0, err.message);
        this.setState({ isLoading: false });
      });
  };
  render() {
    return (
      <div>
        <div className="viewRoot">
          <div className="header"> CHAT DEMO</div>
          <button className="btnLogin" type="submit" onClick={this.onLoginPress}>
            SIGN IN WITH GOOGLE
          </button>
        </div>
        {this.state.isLoading ? (
          <div className="viewLoading">
            <ReactLoading type={"spin"} color={"#203152"} height={"3%"} width={"3%"} />
          </div>
        ) : null}
      </div>
    );
  }
}

export default withRouter(Login);
