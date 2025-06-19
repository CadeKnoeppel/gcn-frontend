import React from "react";
import "./Login.css";
import LoginForm from "./LoginForm";

const Login = () => {
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h1 className="login-title">GCN Portal</h1>
        <p className="login-subtitle">Login to your dashboard</p>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
