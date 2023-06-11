import React, { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { loginThunk as login } from "../../store/session";
import "./LoginForm.css";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import { useModal } from "../../context/Modal";
function LoginFormModal() {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const history = useHistory();
  const [password, setPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [credential, setCredential] = useState("");

  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };
  const handleDemoUser = () => {
    dispatch(login({ credential: "Demo-User", password: "password" })).then(
      () => {
        closeModal();
        history.push("/");
      }
    );
  };
  return (
    <form onSubmit={handleSubmit}>
      <h1>Log In</h1>

      <input
        type="text"
        value={credential}
        onChange={(e) => setCredential(e.target.value)}
        required
        placeholder="Username or Email"
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {errors.credential && <p>{errors.credential}</p>}
      <button type="submit" className="login-btn" disabled={isDisabled}>
        Log In
      </button>
      <button className="demo-user-btn" onClick={handleDemoUser}>
        Log in as Demo User
      </button>
    </form>
  );
}

export default LoginFormModal;
