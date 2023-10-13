import axios from "axios";

const API = axios.create({
  baseURL: 'https://stack2-illuminatus66.netlify.app'
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem("Profile")) {
    req.headers.authorization = `Bearer ${
      JSON.parse(localStorage.getItem("Profile")).token
    }`;
  }

  return req;
});

//auth
export const logIn = (authData) =>
 API.post("/.netlify/functions/login", authData);
export const signUp = (authData) =>
 API.post("/.netlify/functions/signup", authData);

//questions
export const postQuestion = (questionData) =>
  API.post("/.netlify/functions/askQuestion", questionData, { withCredentials: true });
export const getAllQuestions = () => 
  API.get("/.netlify/functions/getAllQuestions");
export const deleteQuestion = (question_id) => 
  API.delete(`/.netlify/functions/deleteQuestion/${question_id}`, { withCredentials: true });
export const voteQuestion = (question_id, value) =>
  API.patch(`/.netlify/functions/voteQuestion/${question_id}`, { value }, { withCredentials: true });
export const searchQuestions = (query) =>
  API.get(`/.netlify/functions/searchQuestions?query=${query}`);

//answers
export const postAnswer = (question_id, noofanswers, answerbody, useranswered) =>
  API.post(`/.netlify/functions/postAnswer`, { question_id, noofanswers, answerbody, useranswered }, { withCredentials: true });
export const deleteAnswer = (question_id, answer_id, noofanswers) =>
  API.patch(`/.netlify/functions/deleteAnswer`, { question_id, answer_id, noofanswers }, { withCredentials: true });

//users
export const getAllUsers = () => 
  API.get("/.netlify/functions/getAllUsers");
export const updateProfile = (user_id, updateData) =>
  API.patch(`/.netlify/functions/updateProfile/${user_id}`, updateData, { withCredentials: true });

