import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import CustomGroupCard from "../GroupCard/GroupCard";
import "./SeeAllGroups.css";
import { getAllEventsThunk as getAllEvents } from "../../store/events";
import Menu from "../Navigation/Menu";
//import { getAllGroups } from "actions/groupActions";
import * as groupActions from "../../store/groups";
const SeeAllGroups = () => {
  const dispatch = useDispatch();
  const allGroups = useSelector((state) => state.groups.allGroups);
  // const isLoading = useSelector((state) => state.groups.isLoading);

  useEffect(() => {
    console.log("before dispatch");
    dispatch(groupActions.SeeAllGroupsThunk());
  }, [dispatch]);

  //   if (isLoading) {
  //     return (
  //       <div className="groups-view">
  //         <h3>Loading...</h3>
  //       </div>
  //     );
  //   }
  useEffect(() => {
    dispatch(getAllEvents());
  }, [dispatch]);
  const allGroupsArray = Object.values(allGroups);
  console.log(allGroups);
  return (
    <div className="groups-view">
      <section className="group-event-section">
        <div className="title-container">
          <NavLink to="/groups" activeClassName="active-link">
            Groups
          </NavLink>
          <NavLink to="/events" activeClassName="active-link">
            Events
          </NavLink>
        </div>
        <p>Groups in Meetup</p>
      </section>
      <section className="groups-list">
        {allGroups &&
          allGroupsArray.map((group) => (
            <CustomGroupCard customGroup={group} key={group.id} />
          ))}
      </section>
    </div>
  );
};

export default SeeAllGroups;
