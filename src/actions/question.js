import * as api from "../api/index";

export const askQuestion = (questionData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.postQuestion(questionData);
    dispatch({ type: "POST_QUESTION", payload: data });
    dispatch(fetchAllQuestions());
    navigate("/");
  } catch (error) {
    console.log(error);
  }
};

export const fetchAllQuestions = () => async (dispatch) => {
  try {
    const { data } = await api.getAllQuestions();
    dispatch({ type: "FETCH_ALL_QUESTIONS", payload: data });
  } catch (error) {
    console.log(error);
  }
};

export const deleteQuestion = (_id, navigate) => async (dispatch) => {
  try {
    await api.deleteQuestion(_id);
    dispatch(fetchAllQuestions());
    navigate("/");
  } catch (error) {
    console.log(error);
  }
};

export const voteQuestion = (_id, value) => async (dispatch) => {
  try {
    await api.voteQuestion(_id, value);
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const postAnswer = (answerData) => async (dispatch) => {
  try {
    const { _id, noOfAnswers, answerBody, userAnswered } = answerData;
    const { data } = await api.postAnswer(
      _id,
      noOfAnswers,
      answerBody,
      userAnswered
    );
    dispatch({ type: "POST_ANSWER", payload: data });
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const deleteAnswer = (_id, answerId, noOfAnswers) => async (dispatch) => {
  try {
    await api.deleteAnswer(_id, answerId, noOfAnswers);
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const searchQuestions = (query) => async (dispatch) => {
  try {
    const { data } = await api.searchQuestions(query);
    dispatch({ type: "SEARCH_QUESTIONS", payload: data });
  } catch (error) {
    console.log(error);
  }
};

