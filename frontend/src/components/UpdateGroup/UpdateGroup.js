import React from "react";
import { useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./UpdateGroup.css";
import {
  updateGroupThunk as updateGroup,
  SeeSingleGroupThunk as getSingleGroup,
} from "../../store/groups";
import { useParams } from "react-router-dom";

const UpdateGroup = () => {
  const history = useHistory();
  const user = useSelector((state) => state.session.user);
  const { groupId } = useParams();
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const validation = {};
  const [errors, setErrors] = useState({});
  const [groupType, setGroupType] = useState("");
  const [groupStatus, setGroupStatus] = useState("");

  useEffect(() => {
    dispatch(getSingleGroup(groupId));
  }, [dispatch, groupId]);

  useEffect(() => {
    if (user === null) {
      history.push("/");
    }
  }, [user, history]);

  const handleGroupSubmit = async (e) => {
    if (!location) {
      validation.location = "Location is required";
    }
    if (!name) {
      validation.name = "Name is required";
    }
    if (desc.length < 50) {
      validation.desc = "Description must be at least 50 characters long";
    }
    if (!groupType || groupType === "(select one)") {
      validation.groupType = "Group Type is required";
    }
    if (!groupStatus || groupStatus === "(select one)") {
      validation.groupStatus = "Visibility Type is required";
    }
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    const [city, state] = location.split(", ");

    const updatedGroup = {
      name,
      about: desc,
      type: groupType,
      private: groupStatus === "Private" ? true : false,
      city,
      state,
    };

    const res = await dispatch(updateGroup(updatedGroup, groupId));

    if (res.id) {
      history.push(`/groups/${res.id}`);
    } else {
      setErrors(res.errors);
    }
  };
  return (
    <div className="group-updater-container">
      <section className="group-updater-heading">
        <h3>UPDATE YOUR GROUP'S INFORMATION</h3>
        <p>
          We'll walk you through a few steps to update your group's information
        </p>
      </section>
      <section className="group-updater-location-input-section">
        <h3>First, set your group's location</h3>
        <p>
          Meetup groups meet locally, in person and online. We'll connect you
          with people in your area, and more can join you online.
        </p>
        <input
          className="group-updater-location-input"
          placeholder="City, STATE"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        {errors.location && <p error={errors.location} />}
      </section>
      <section className="group-updater-group-name-input-section">
        <h3>What is the name of your group?</h3>
        <p>
          Choose a name that will give people a clear idea of what the group is
          about. Feel free to get creative!
        </p>
        <input
          className="group-updater-group-name-input"
          placeholder="What is your group name?"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p error={errors.name} />}
      </section>
      <section className="group-updater-group-desc-input-section">
        <h3>Now describe what your group will be about</h3>
        <p>People will see this when we promote your group.</p>
        <ol className="group-updater-group-desc-prompts">
          <li>What's the purpose of the group?</li>
          <li>Who should join?</li>
          <li>What will you do at your events?</li>
        </ol>
        <textarea
          placeholder="Please write at least 50 characters"
          cols="35"
          rows="10"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        ></textarea>
        {errors.desc && <p error={errors.desc} />}
      </section>
      <section className="group-updater-final-steps-section">
        <h3>Final steps...</h3>
        <div className="group-updater-group-type-container">
          <p>Is this an in-person or online group?</p>
          <select
            className="group-updater-group-type-input"
            value={groupType}
            onChange={(e) => setGroupType(e.target.value)}
          >
            <option value="(select one)">(select one)</option>
            <option value="Online">Online</option>
            <option value="In person">In Person</option>
          </select>
          {errors.groupType && <p error={errors.groupType} />}
        </div>
        <div className="group-updater-group-status-container">
          <p>Is this group private or public?</p>
          <select
            className="group-updater-group-status-input"
            value={groupStatus}
            onChange={(e) => setGroupStatus(e.target.value)}
          >
            <option value="(select one)">(select one)</option>
            <option value="Private">Private</option>
            <option value="Public">Public</option>
          </select>
          {errors.groupStatus && <p error={errors.groupStatus} />}
        </div>
      </section>
      <section className="group-updater-submission-section">
        <button
          className="group-updater-submit-btn"
          onClick={handleGroupSubmit}
        >
          Update Group
        </button>
      </section>
    </div>
  );
};
export default UpdateGroup;
