import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import Menu from "./Menu";
import "./Navigation.css";
import WikiTaz from "./WikiTaz.svg";
import OpenModalMenuItem from "./OpenModalMenuItem";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);
  const sessionLinks = sessionUser ? (
    <div className="user-profile-container">
      <NavLink to="/groups/new" className="start-group-link">
        Start a new group
      </NavLink>
      <ul className="dropdown-container">
        <Menu user={sessionUser} />
      </ul>
    </div>
  ) : (
    <div className="action-buttons-container">
      <OpenModalMenuItem
        itemText="Log In"
        modalComponent={<LoginFormModal />}
      />
      <OpenModalMenuItem
        className="action-button"
        itemText="Sign Up"
        modalComponent={<SignupFormModal />}
      />
    </div>
  );
  return (
    <ul className="navbar">
      <li>
        <NavLink id="WikiTaz" exact to="/">
          <img src={WikiTaz} alt="WikiTaz"></img>
        </NavLink>
      </li>
      {isLoaded && (
        <li>
          {sessionLinks}
          {/* <Menu user={sessionUser} /> */}
        </li>
      )}
    </ul>
  );
}

export default Navigation;
