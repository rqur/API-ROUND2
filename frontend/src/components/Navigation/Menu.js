import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import * as sessionActions from "../../store/session";
import OpenModalMenuItem from "./OpenModalMenuItem";
import LoginFormModal from "../LoginFormModal";
import "./Menu.css";
import { logout } from "../../store/session";
import { useSelector } from "react-redux";
import SignupFormModal from "../SignupFormModal";
import { NavLink, useHistory } from "react-router-dom/cjs/react-router-dom";

function Menu({ user }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    history.push("/");
  };
  const YourGroupsClickMe = (e) => {
    closeMenu();
    history.push("/groups");
  };
  const YourEventsClickMe = (e) => {
    closeMenu();
    history.push("/events");
  };
  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");
  const profileArrow = showMenu ? "up" : "down";
  return (
    <>
      <div className="menu-container" onClick={openMenu}>
        <i className="fas fa-user-circle"></i>
        <i
          className={`fa-solid fa-chevron-${profileArrow} profile-button-arrow`}
        ></i>
      </div>

      <ul className={ulClassName} ref={ulRef}>
        <li>{`Hello, ${user.username}`}</li>
        <li>
          {user.firstName} {user.lastName}
        </li>
        <li>{user.email}</li>
        <button on onClick={YourGroupsClickMe}>
          View Groups
        </button>
        <button on onClick={YourEventsClickMe}>
          View Events
        </button>

        <li>
          <button onClick={logout}>Log Out</button>
        </li>
      </ul>
    </>
  );
}

export default Menu;
