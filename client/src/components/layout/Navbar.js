import React, { Fragment, useState } from "react";
import avatar from "../../img/hotel.svg";
import { connect } from "react-redux";
import classnames from "classnames";
import { toggleNavbar } from "../../actions/layoutAction";
import { ReactComponent as Reload } from "../../img/reload.svg";
import { loadRooms } from "../../actions/roomsActions";

const Navbar = ({
  isAuthenticated,
  user,
  toggleNavbar,
  isNavbarOpen,
  loadRooms,
  getReportDate
}) => {
  const [isBtnClicked, setBtnClicked] = useState(false);
  return (
    <nav className="nav">
      <div className="avatar">
        {isAuthenticated ? (
          <Fragment>
            <img src={avatar} alt="avatar" className="avatar__image" />
            <h3 className="avatar__greet text-white ml-1 sm-text-1">
              Hi,{" "}
              {user
                ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
                : "dear"}
            </h3>
          </Fragment>
        ) : (
          <Fragment>
            <h3 className="avatar__greet text-white ml-1 sm-text-1">
              Housekeeping App
            </h3>
          </Fragment>
        )}
      </div>
      <div className="flex-right">
        <button
          className="btn reload"
          onClick={() => {
            setBtnClicked(!isBtnClicked);
            loadRooms(getReportDate);
          }}
        >
          <Reload className={classnames({ active: isBtnClicked })} />
        </button>
        <label className={classnames("hamburger-container")}>
          <div
            className={classnames("hamburger", {
              active: isNavbarOpen
            })}
          ></div>
          <input
            type="checkbox"
            onChange={() => {
              toggleNavbar();
            }}
            className="hamburger__checkbox"
            name="hamburger"
            id="hamburger"
          />
        </label>
      </div>
    </nav>
  );
};

export default connect(
  state => ({
    isAuthenticated: state.authReducer.isAuthenticated,
    user: state.authReducer.user,
    isNavbarOpen: state.layoutReducer.isNavbarOpen,
    getReportDate: state.filterReducer.getCurrentCalendarValue
  }),
  { toggleNavbar, loadRooms }
)(Navbar);
