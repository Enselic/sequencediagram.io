import { combineReducers } from "redux";
import core from "./core";
import pending from "./pending";

export * from "./core";
export * from "./pending";

export default combineReducers({
  core,
  pending,
});
