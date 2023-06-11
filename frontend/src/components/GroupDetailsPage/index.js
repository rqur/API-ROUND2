import "./GroupDetailsPage.css";
import { NavLink, useParams } from "react-router-dom/cjs/react-router-dom.min";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import React from "react";
import { useEffect } from "react";
import { SeeSingleGroupThunk as getSingleGroup } from "../../store/groups";
import DeleteGroup from "../DeleteGroup/DeleteGroup";
import "./GroupDetailsPage.css";
import OpenModalMenuItem from "../Navigation/OpenModalMenuItem";
import { useModal } from "../../context/Modal";

const GroupDetailsPage = () => {
  const sessionUser = useSelector((state) => state.session.user);
  const dispatch = useDispatch();
  const { groupId } = useParams();
  const group = useSelector((state) => state.groups.singleGroup);
  const groupOrganizerId = group.organizerId;

  const history = useHistory();

  useEffect(() => {
    dispatch(getSingleGroup(groupId));
  }, [dispatch]);

  if (!group.id || !group.Organizer) return <h3>Loading...</h3>;

  const { firstName, lastName } = group.Organizer;

  const handleDeleteGroup = async (groupId) => {
    console.log(`Deleting group with ID: ${groupId}`);
    try {
      await dispatch(DeleteGroup(groupId));
      history.push("/groups");
    } catch (error) {
      console.log("Error deleting group:", error);
    }
  };

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
              <p>## events</p>
              <span>•</span>
              <p>{group.private ? "Private" : "Public"}</p>
            </div>
            <p>
              Organized by {firstName} {lastName}
            </p>
          </div>
          <div className="crud-container">
            {sessionUser && (
              <button
                className="group-details__join-group-btn"
                onClick={() => {
                  console.log(3);
                }}
              >
                Create Event
              </button>
            )}
            {sessionUser && sessionUser.id === groupOrganizerId && (
              <button
                className="group-details__join-group-btn"
                onClick={() => {}}
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
        </div>
      </section>
    </div>
  );
};

export default GroupDetailsPage;
