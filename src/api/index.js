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

export const logIn = (authData) => API.post("/.netlify/functions/login", authData);
export const signUp = (authData) => API.post("/.netlify/functions/signup", authData);

export const postQuestion = (questionData) =>
  API.post("/.netlify/functions/askQuestion", questionData, { withCredentials: true });
export const getAllQuestions = () => API.get("/.netlify/functions/getAllQuestions");
export const deleteQuestion = (_id) => API.delete(`/.netlify/functions/deleteQuestion/${_id}`, { withCredentials: true });
export const voteQuestion = (_id, value) =>
  API.patch(`/.netlify/functions/voteQuestion/${_id}`, { value }, { withCredentials: true });
export const searchQuestions = (query) =>
  API.get(`/.netlify/functions/searchQuestions?query=${query}`);
  
export const postAnswer = (_id, noOfAnswers, answerBody, userAnswered) =>
  API.patch(`/.netlify/functions/postAnswer/${_id}`, { noOfAnswers, answerBody, userAnswered }, { withCredentials: true });
export const deleteAnswer = (_id, answerId, noOfAnswers) =>
  API.patch(`/.netlify/functions/deleteAnswer/${_id}`, { answerId, noOfAnswers }, { withCredentials: true });

export const getAllUsers = () => API.get("/.netlify/functions/getAllUsers");
export const updateProfile = (_id, updateData) =>
  API.patch(`/.netlify/functions/updateProfile/${_id}`, updateData, { withCredentials: true });

