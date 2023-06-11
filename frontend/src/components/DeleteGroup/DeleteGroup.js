import { useHistory } from "react-router-dom";
import { useModal } from "../../context/Modal";
import { deleteGroupThunk as deleteGroup } from "../../store/groups";
import { useDispatch } from "react-redux";
import GroupDetailsPage from "../GroupDetailsPage";
import "./DeleteGroup.css";
import React from "react";
const DeleteGroup = ({ groupToDelete, setIsDeletingGroup }) => {
  const { closeModal } = useModal();
  const dispatch = useDispatch();
  const history = useHistory();

  const handleDelete = async () => {
    if (setIsDeletingGroup) {
      setIsDeletingGroup(true);
    }

    const response = await dispatch(deleteGroup(groupToDelete));
    closeModal();
    history.push("/groups");
  };

  const handleKeep = () => {
    console.log("Group kept!");
    closeModal();
  };

  return (
    <div className="confirm-delete-modal">
      <h2>Confirm Delete</h2>
      <p>Are you sure you want to remove this group?</p>
      <button
        onClick={handleDelete}
        className="confirm-delete-modal__delete-btn"
      >
        Yes (Delete Group)
      </button>
      <button onClick={handleKeep} className="confirm-delete-modal__keep-btn">
        No (Keep Group)
      </button>
    </div>
  );
};

export default DeleteGroup;
