import "./EventListPage.css";
import { useHistory } from "react-router-dom";

import React from "react";
import cartoon from "./cartoon.jpg";
export const EventCard = ({ event }) => {
  const history = useHistory();

  const handleEventClick = () => {
    history.push(`/events/${event.id}`);
  };

  return (
    <div className="event-card-container" onClick={handleEventClick}>
      <div className="event-card-image-container">
        <img className="event-card-image" src={cartoon} alt="" />
        <div className="event-card-info-container"></div>
        <div className="event-card-status-info">
          <h2 className="event-card-title">{event.name}</h2>
          <div className="event-card-location">
            <p className="event-card-description">{event.description}</p>
            {event.Group.city}, {event.Group.state}
          </div>
          <span className="event-card-date">{event.startDate}</span>
          <p>## events</p>
          <span className="event-card-bullet">•</span>
          <p>{event.private ? "Private" : "Public"}</p>
        </div>
      </div>
    </div>
  );
};
