import { useDispatch, useSelector } from "react-redux";
import "./CreateEvent.css";
import { useEffect, useState } from "react";
import { createEventThunk as createEvent } from "../../store/events";
import { SeeSingleGroupThunk as getSingleGroup } from "../../store/groups";
import { useParams, useHistory } from "react-router-dom";
import React from "react";

const CreateEvent = () => {
  const dispatch = useDispatch();
  const { groupId } = useParams();
  const [name, setName] = useState("");
  const group = useSelector((state) => state.groups.singleGroup);
  const history = useHistory();
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [type, setType] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [inFlight, setInFlight] = useState(false);

  useEffect(() => {
    const validation = {};
    if (!name) {
      validation.name = "Name is required";
    }
    if (!type || type === "(select one)") {
      validation.type = "Event type is required";
    }
    if (!startDate) {
      validation.eventStart = "Event start date is required";
    }
    if (!endDate) {
      validation.eventEnd = "Event end date is required";
    }
    if (description.length < 30) {
      validation.description =
        "Description must be at least 30 characters long";
    }
    if (price < 0) {
      validation.price = "Price must not be negative";
    }
    setErrors(validation);
  }, [name, type, startDate, endDate, description, price]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInFlight(true);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const newEvent = {
      groupId: parseInt(groupId),
      name,
      type,
      price: parseInt(price),
      capacity: 20,
      description,
      startDate,
      endDate,
      venueId: 1,
    };

    const res = await dispatch(createEvent(newEvent));
    if (res.errors) {
      setErrors(res.errors);
    } else {
      history.push(`/events/${res.id}`);
    }
  };

  useEffect(() => {
    dispatch(getSingleGroup(groupId));
  }, [dispatch, groupId]);

  return (
    <div className="event-creator">
      <section className="event-creator__heading-section">
        <h3>Create an event for {group.name}</h3>
        <div className="event-creator__name-input-container">
          <p>What is the name of your event?</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Event Name"
          />
        </div>
        {errors.name && inFlight && (
          <p style={{ color: "red" }} p>
            {errors.name}
          </p>
        )}
      </section>
      <section className="event-creator__visibility-price-section">
        <div className="event-creator__type-input-container">
          <p>Is this an in-person or online event?</p>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="(select one)">(select one)</option>
            <option value="in person">In Person</option>
            <option value="online">Online</option>
          </select>
          {errors.type && inFlight && (
            <p style={{ color: "red" }} p>
              {errors.type}
            </p>
          )}{" "}
        </div>
        <div className="event-creator__price-input-container">
          <p>What is the price for your event?</p>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            min={0}
          />
          {errors.price && inFlight && (
            <p style={{ color: "red" }} p>
              {errors.price}
            </p>
          )}{" "}
        </div>
      </section>
      <section className="event-creator__date-section">
        <div className="event-creator__start-date-container">
          <p>When does your event start?</p>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          {errors.eventStart && inFlight && (
            <p style={{ color: "red" }} p>
              {errors.eventStart}
            </p>
          )}{" "}
        </div>
        <div className="event-creator__end-date-container">
          <p>When does your event end?</p>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {errors.eventEnd && inFlight && (
            <p style={{ color: "red" }} p>
              {errors.eventEnd}
            </p>
          )}{" "}
        </div>
      </section>
      <section className="event-creator__image-section">
        <div className="event-creator__image-input-container">
          <p>Please add an image URL for your event below:</p>
          <input
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            placeholder="Image URL"
          />
          {errors.imgUrl && inFlight && (
            <p style={{ color: "red" }} p>
              {errors.imgUrl}
            </p>
          )}{" "}
        </div>
      </section>
      <section className="event-creator__desc-section">
        <div className="event-creator__desc-input-container">
          <p>Please describe your event:</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please include at least 30 characters"
          />
          {errors.description && inFlight && (
            <p style={{ color: "red" }} p>
              {errors.description}
            </p>
          )}{" "}
        </div>
      </section>
      <button
        onClick={handleSubmit}
        className="event-creator__create-event-btn"
      >
        Create Event
      </button>
    </div>
  );
};

export default CreateEvent;
