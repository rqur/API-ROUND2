import React, { useEffect, useState } from "react";
import CustomGroupCard from "../GroupCard/GroupCard";
import { csrfFetch } from "../../store/csrf";
import "./ManageGroup.css";

const ManageGroup = () => {
  const [userGroups, setUserGroups] = useState([]);
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

  if (!userGroups) return <h3>You're Not a Member of any of these groups</h3>;

  return (
    <div className="group-management-container">
      <section className="group-management-section">
        <div className="group-management-title-container">
          <p>Your groups in Meetup</p>
        </div>
      </section>
      <section className="group-management-list">
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

export default ManageGroup;
