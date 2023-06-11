import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getAllEventsThunk as getAllEvents } from "../../store/events";
import { EventCard } from "./EventCard";
import "./EventListPage.css";

const EventListPage = () => {
  const dispatch = useDispatch();
  const allEvents = useSelector((state) => state.events.allEvents);
  const [currentSelection, setCurrentSelection] = useState("Events");
  useEffect(() => {
    dispatch(getAllEvents());
  }, [dispatch]);

  console.log("allEvents", allEvents);
  if (!allEvents) {
    return (
      <div className="loading-container">
        <h3>Loading...</h3>
      </div>
    );
  }

  const allEventsArr = Object.values(allEvents);
  return (
    <div className="events-container">
      <div className="selection-section">
        <div className="title-container">
          <NavLink
            to="/events"
            className={(isActive) =>
              isActive ? "active-link" : "inactive-link"
            }
            onClick={(e) => setCurrentSelection(e.target.innerText)}
          >
            Events
          </NavLink>
          <NavLink
            to="/groups"
            className={(isActive) =>
              isActive ? "active-link" : "inactive-link"
            }
            onClick={(e) => setCurrentSelection(e.target.innerText)}
          >
            Groups
          </NavLink>
        </div>
        <p>{currentSelection} in Meetup</p>
      </div>
      <div className="event-list">
        {allEventsArr.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventListPage;
