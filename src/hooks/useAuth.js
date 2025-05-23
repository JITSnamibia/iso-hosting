// src/hooks/useAuth.js
import React, { useContext } from "react";
import { AuthContext } from "../context/authContext";

export const useAuth = () => {
  return useContext(AuthContext);
};