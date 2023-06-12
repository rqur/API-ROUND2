import { useHistory } from "react-router-dom";
import React from "react";
import "./GroupCard.css";
import useme from "./useme.svg";
import { useSelector } from "react-redux";

const CustomGroupCard = ({ customGroup }) => {
  const history = useHistory();
  const events = useSelector((s) => s.events.allEvents);
  const groupEvents = events.filter((e) => e.groupId === customGroup.id);
  const handleClick = () => {
    history.push(`/groups/${customGroup.id}`);
  };
  console.log(events);
  return (
    <article className="custom-group-card" onClick={handleClick}>
      <div className="custom-group-card__image">
        <img src={useme} alt="useme" />
      </div>
      <header className="custom-group-card__header">
        <h2 className="custom-group-card__title">{customGroup.name}</h2>
        <p className="custom-group-card__location">
          {customGroup.city}, {customGroup.state}
        </p>
        <p className="custom-group-card__about">{customGroup.about}</p>
        <div className="custom-group-card__footer">
          <p>{groupEvents.length} Events</p>
          <span>•</span>
          <p>{customGroup.private ? "Private" : "Public"}</p>
        </div>
      </header>
    </article>
  );
};

export default CustomGroupCard;
