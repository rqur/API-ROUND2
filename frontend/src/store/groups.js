import { csrfFetch } from "./csrf";
const See_ALL_GROUPS = "groups/SeeAllGroups";
const CREATE_GROUP = "groups/createGroup";
const See_SINGLE_GROUP = "groups/SeeSingleGroup";
const DELETE_GROUP = "groups/deleteGroup";
const UPDATE_GROUP = "groups/updateGroup";

//const ADD_GROUP_IMAGE = "groups/addGroupImage";

const GetAllGroups = (groups) => ({
  type: See_ALL_GROUPS,
  payload: groups,
});

const createGroup = (group) => ({
  type: CREATE_GROUP,
  payload: group,
});
const GetSingleGroup = (group) => {
  return {
    type: See_SINGLE_GROUP,
    payload: group,
  };
};
const deleteGroup = (group) => {
  return {
    type: DELETE_GROUP,
    payload: group,
  };
};
const updateGroup = (group) => {
  return {
    type: UPDATE_GROUP,
    payload: group,
  };
};

// const addGroupImage = (image) => ({
//   type: ADD_GROUP_IMAGE,
//   payload: image,
// });

export const SeeAllGroupsThunk = () => async (dispatch) => {
  const res = await csrfFetch("/api/groups");
  const data = await res.json();
  console.log("data", data);

  dispatch(GetAllGroups(data.Groups));
  return data.Groups;
};
export const SeeSingleGroupThunk = (groupId) => async (dispatch) => {
  try {
    const res = await fetch(`/api/groups/${groupId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch group data.");
    }

    const group = await res.json();
    console.log("group", group);
    dispatch(GetSingleGroup(group));
    return group;
  } catch (error) {
    console.error(error);
  }
};

export function deleteGroupThunk(groupToDelete) {
  console.log(groupToDelete);
  return async function deleteGroupThunkDispatch(dispatch) {
    try {
      const res = await csrfFetch(`/api/groups/${groupToDelete.id}`, {
        method: "DELETE",
      });

      const message = await res.json();
      dispatch(deleteGroup(groupToDelete));

      return message;
    } catch (err) {
      console.log(err);
      return err;
    }
  };
}

// export const addImageToGroupThunk = (image, groupId) => async (dispatch) => {
//   const imgRes = await csrfFetch(`/api/groups/${groupId}/images`, {
//     method: "POST",
//     body: JSON.stringify(image),
//   });

// if (imgRes.ok) {
//   const img = await imgRes.json();
//   dispatch(addGroupImage(img));
//   return img;
//}
//};
export const updateGroupThunk = (group, image) => async (dispatch) => {
  const res = await csrfFetch(`/api/groups/${group.id}`, {
    method: "PUT",
    body: JSON.stringify(group),
  });

  if (res.ok) {
    const newGroup = await res.json();
    dispatch(updateGroup(newGroup));
    // dispatch(addImageToGroupThunk(image, newGroup.id));

    return newGroup;
  }
};
export const createGroupThunk = (group, image) => async (dispatch) => {
  const res = await csrfFetch("/api/groups", {
    method: "POST",
    body: JSON.stringify(group),
  });
  const newGroup = await res.json();

  if (res.ok) {
    dispatch(createGroup(newGroup));
    // dispatch(addImageToGroupThunk(image, newGroup.id));
  }
  return newGroup;
};
const initialState = { allGroups: {}, singleGroup: {} };

const groupsReducer = (state = initialState, action) => {
  switch (action.type) {
    case See_ALL_GROUPS: {
      const newState = { ...state };
      newState.allGroups = action.payload;
      return newState;
    }
    case UPDATE_GROUP: {
      const newState = { ...state };
      newState.singleGroup = action.payload;
      return newState;
    }
    case CREATE_GROUP: {
      const newState = { ...state };
      newState.singleGroup = action.payload;
      return newState;
    }
    case See_SINGLE_GROUP: {
      const newState = { ...state };
      newState.singleGroup = action.payload;
      return newState;
    }
    case DELETE_GROUP:
      const newState = {
        ...state,
        allGroups: { ...state.allGroups },
        singleGroup: {},
      };
      delete newState.allGroups[action.payload.id];
      return newState;
    default:
      return state;
  }
};
export default groupsReducer;
