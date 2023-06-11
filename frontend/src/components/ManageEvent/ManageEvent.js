import React, { useEffect, useState } from "react";
import CustomGroupCard from "../EventCard/EventCard";
import { csrfFetch } from "../../store/csrf";
import "./ManageEvent.css";

const ManageEvent = () => {
  const [userEvent, setUserEvent] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await csrfFetch("/api/groups/current");
        const data = await response.json();
        setUserGroups(data.Groups);
      } catch (error) {
        setErrors(error);
      }
    };

    fetchData();
  }, []);

  if (!userGroups) return <h3>Loading...</h3>;

  return (
    <div className="group-management-view">
      <section className="group-management-view__group-event-selection-section">
        <div className="group-management-view__title-container">
          <p>Your groups in Meetup</p>
        </div>
      </section>
      <section className="group-management-view__list">
        {userGroups.map((group, index, array) => (
          <CustomGroupCard
            key={group.id}
            group={group}
            isManagementPage={true}
          />
        ))}
      </section>
    </div>
  );
};

export default ManageEvent;
