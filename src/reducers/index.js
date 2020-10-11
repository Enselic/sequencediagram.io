import { combineReducers } from "redux";
import backend from "./backend";
import core from "./core";
import pending from "./pending";

export * from "./backend";
export * from "./core";
export * from "./pending";

export default combineReducers({
  backend,
  core,
  pending,
});
