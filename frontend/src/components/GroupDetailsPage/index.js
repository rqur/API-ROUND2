import "./GroupDetailsPage.css";
import { NavLink, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import React from "react";
import { useEffect } from "react";
import { SeeSingleGroupThunk as getSingleGroup } from "../../store/groups";
import DeleteGroup from "../DeleteGroup/DeleteGroup";
import "./GroupDetailsPage.css";
import OpenModalMenuItem from "../Navigation/OpenModalMenuItem";
import { useModal } from "../../context/Modal";
import { EventCard } from "../EventListPage/EventCard";
import { getAllEventsThunk as getAllEvents } from "../../store/events";
import spaceMarineImage from "./viglomir_minimalistic_tarot_card_of_Space_Marine_from_warhammer_61ca53db-ebc1-4c9b-ac5c-3ae4576f3126.png";
const GroupDetailsPage = () => {
  const sessionUser = useSelector((state) => state.session.user);
  const dispatch = useDispatch();
  const { groupId } = useParams();
  const group = useSelector((state) => state.groups.singleGroup);
  const allEvents = useSelector((state) => state.events.allEvents);
  const groupOrganizerId = group.organizerId;
  const history = useHistory();

  useEffect(() => {
    dispatch(getSingleGroup(groupId));
    dispatch(getAllEvents());
  }, [dispatch]);

  const navigateToNewEvent = () => {
    // 👇️ navigate to create event page
    history.push(`/groups/${groupId}/events/new`);
  };

  if (!group.id || !group.Organizer) return <h3>Access Denied</h3>;

  const { firstName, lastName } = group.Organizer;

  const CURRENT_DATE = new Date().getTime();
  const sortedEvents = allEvents.sort((eventA, eventB) => {
    let dateA = new Date(eventA.startDate).getTime();
    let dateB = new Date(eventB.startDate).getTime();
    if (dateA > CURRENT_DATE && dateB > CURRENT_DATE) return dateA - dateB;
    else if (dateA < CURRENT_DATE && dateB < CURRENT_DATE) return dateB - dateA;
    else if (dateA < CURRENT_DATE) return 1;
    else return -1;
  });
  const groupEvents = sortedEvents.filter(
    (event) => event.groupId === group.id
  );
  return (
    <div className="group-details">
      <div className="group-details__breadcrumb">
        <span>
          <i className="fa-solid fa-arrow-left"></i>
        </span>
        <NavLink to="/groups">Groups</NavLink>
      </div>
      <section className="group-details__group-section">
        <div className="group-details__image-container">
          <img
            className="group-details__group-image"
            src="https://secure.meetupstatic.com/next/images/shared/online_events.svg?w=1080"
            alt="img"
          ></img>
        </div>
        <div className="group-details__group-info-container">
          <div className="group-details__group-info">
            <h2 className="no-margin">{group.name}</h2>
            <p>
              {group.city}, {group.state}
            </p>
            <div className="group-details__group-status-container">
              <p>{groupEvents.length} Events</p>
              <span>•</span>
              <p>{group.private ? "Private" : "Public"}</p>
            </div>
            <p>
              Organized by {firstName} {lastName}
            </p>
          </div>
          <div className="crud-container">
            {sessionUser && sessionUser.id !== groupOrganizerId && (
              <button
                className="group-details__join-group-btn"
                onClick={() => alert("Feature Coming Soon!")}
              >
                Join this Group
              </button>
            )}
            {sessionUser && sessionUser.id === groupOrganizerId && (
              <button
                className="createEvent"
                onClick={() => {
                  history.push(`/groups/${groupId}/events/new`);
                }}
              >
                Create Event
              </button>
            )}
            {sessionUser && sessionUser.id === groupOrganizerId && (
              <button
                className="group-details__join-group-btn"
                onClick={() => {
                  history.push(`/groups/${groupId}/edit`);
                }}
              >
                Update
              </button>
            )}
            {sessionUser && sessionUser.id === groupOrganizerId && (
              <OpenModalMenuItem
                itemText="Delete"
                modalComponent={<DeleteGroup groupToDelete={group} />}
              />
            )}
          </div>
        </div>
      </section>
      <section className="group-details__more-details-section">
        <div className="group-details__more-details-container">
          <div className="group-details__organizer-info">
            <h2>Organizer</h2>
            <p>
              {firstName} {lastName}
            </p>
          </div>
          <div className="group-details__about-info">
            <h2>What we're about</h2>
            <p>{group.about}</p>
          </div>
          <div className="group-detail-event">
            <h3>Upcoming Events {groupEvents.length}</h3>
            <div className="group-event-card">
              {groupEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GroupDetailsPage;
