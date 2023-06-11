import { useDispatch, useSelector } from "react-redux";
import "./CreateEvent.css";
import { useEffect, useState } from "react";
import { createEventThunk as createEvent } from "../../store/events";
import { SeeSingleGroupThunk as getSingleGroup } from "../../store/groups";
import { useParams, useHistory } from "react-router-dom";
import React from "react";
const CreateEvent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { groupId } = useParams();
  const [name, setName] = useState("");
  const group = useSelector((state) => state.groups.singleGroup);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [type, setType] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e) => {
    const validation = {};
    if (!name) {
      validation.name = "Name is required";
    }
    if (!type || type === "(select one)") {
      validation.type = "Event type is required";
    }
    if (!startDate) {
      validation.eventStart = "Event start is required";
    }
    if (!endDate) {
      validation.eventEnd = "Event end is required";
    }
    const isValidImgUrl =
      imgUrl.endsWith(".jpg") ||
      imgUrl.endsWith(".png") ||
      imgUrl.endsWith(".jpeg");
    if (!isValidImgUrl) {
      validation.imgUrl = "Image Url must end in .png, .jpg, or .jpeg";
    }
    if (description.length < 30) {
      validation.description =
        "Description must be at least 30 characters long";
    }
    if (Object.values(validation).length > 0) {
      setErrors(validation);
      return;
    }

    const newEvent = {
      venueId: group.Venues[0].id,
      name,
      type,
      price: parseInt(price),
      capacity: 20,
      description,
      startDate,
      endDate,
    };

    const newImage = {
      url: imgUrl,
      preview: true,
    };

    const res = await dispatch(
      createEvent(newEvent, groupId, newImage, group.Venues[0])
    );

    if (res.id) {
      history.push(`/events/${res.id}`);
    } else {
      setErrors(res.errors);
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
        {errors.name && <p error={errors.name} />}
      </section>
      <section className="event-creator__visibility-price-section">
        <div className="event-creator__type-input-container">
          <p>Is this an in-person or online event?</p>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="(select one)">(select one)</option>
            <option value="In person">In Person</option>
            <option value="Online">Online</option>
          </select>
          {errors.type && <p error={errors.type} />}
        </div>
        <div className="event-creator__price-input-container">
          <p>What is the price for your event?</p>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            min={0}
          />
          {errors.price && <p error={errors.price} />}
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
          {errors.eventStart && <p error={errors.eventStart} />}
        </div>
        <div className="event-creator__end-date-container">
          <p>When does your event end?</p>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {errors.eventEnd && <p error={errors.eventEnd} />}
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
          {errors.imgUrl && <p error={errors.imgUrl} />}
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
          {errors.description && <p error={errors.description} />}
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
