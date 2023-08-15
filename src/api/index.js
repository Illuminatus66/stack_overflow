import axios from "axios";

const API = axios.create({
  baseURL: 'https://illuminatus66-stackoverflow.netlify.app'
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
export const deleteQuestion = (id) => API.delete(`/.netlify/functions/deleteQuestion/${id}`, { withCredentials: true });
export const voteQuestion = (id, value) =>
  API.patch(`/.netlify/functions/voteQuestion/${id}`, { value }, { withCredentials: true });
export const searchQuestions = (query) =>
  API.get(`/.netlify/functions/searchQuestions?query=${query}`);
  
export const postAnswer = (id, noOfAnswers, answerBody, userAnswered) =>
  API.patch(`/.netlify/functions/postAnswer/${id}`, { noOfAnswers, answerBody, userAnswered }, { withCredentials: true });
export const deleteAnswer = (_id, answerId, noOfAnswers) =>
  API.patch(`/.netlify/functions/deleteAnswer/${_id}`, { answerId, noOfAnswers }, { withCredentials: true });

export const getAllUsers = () => API.get("/.netlify/functions/getAllUsers");
export const updateProfile = (id, updateData) =>
  API.patch(`/.netlify/functions/updateProfile/${id}`, updateData, { withCredentials: true });

