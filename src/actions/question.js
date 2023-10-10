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

export const deleteQuestion = (question_id, navigate) => async (dispatch) => {
  try {
    await api.deleteQuestion(question_id);
    dispatch(fetchAllQuestions());
    navigate("/");
  } catch (error) {
    console.log(error);
  }
};

export const voteQuestion = (question_id, value) => async (dispatch) => {
  try {
    await api.voteQuestion(question_id, value);
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const postAnswer = (answerData) => async (dispatch) => {
  try {
    const { question_id, noofanswers, answerbody, useranswered } = answerData;
    const { data } = await api.postAnswer(
      question_id,
      noofanswers,
      answerbody,
      useranswered
    );
    dispatch({ type: "POST_ANSWER", payload: data });
    dispatch(fetchAllQuestions());
  } catch (error) {
    console.log(error);
  }
};

export const deleteAnswer = (question_id, answer_id, noofanswers) => async (dispatch) => {
  try {
    await api.deleteAnswer(question_id, answer_id, noofanswers);
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

