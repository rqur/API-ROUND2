import { useDispatch } from "react-redux";
import { Switch } from "react-router-dom";
import React, { useState, useEffect } from "react";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import LandingPage from "./components/LandingPage";
import { Route } from "react-router-dom";
import CreateGroupsForm from "./components/CreateGroupsForm/CreateGroupsForm";
import SeeAllGroups from "./components/SeeAllGroups/SeeAllGroups";
import GroupDetailsPage from "./components/GroupDetailsPage";
import ManageGroup from "./components/ManageGroup";
import EventsListPage from "./components/EventListPage/EventListPage";
import CreateEvent from "./components/CreatEvent/CreateEvent";
import { restoreUser } from "./store/session";
import EventDetails from "./EventDetails/EventDetails";
import UpdateGroup from "./components/UpdateGroup/UpdateGroup";
function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route exact path="/">
            <LandingPage />
          </Route>
          <Route exact path="/groups/new">
            <CreateGroupsForm />
          </Route>
          <Route exact path="/groups">
            <SeeAllGroups />
          </Route>
          <Route exact path="/groups/:groupId">
            <GroupDetailsPage />
          </Route>
          <Route path="/groups/current">
            <ManageGroup />
          </Route>
          <Route path="/events/:eventId">
            <EventDetails />
          </Route>
          <Route exact path="/events">
            <EventsListPage />
          </Route>
          <Route path="/groups/:groupId/events/new">
            <CreateEvent />
          </Route>
          <Route path="/groups/:groupId/edit">
            <UpdateGroup />
          </Route>
        </Switch>
      )}
    </>
  );
}

export default App;
