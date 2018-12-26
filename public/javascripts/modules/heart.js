import axios from "axios";
import { $ } from "./bling";

function ajaxHeart(e) {
  // this represents the error
  e.preventDefault(); // if this method runs, lets do this client side.
  axios
    .post(this.action)
    .then(res => {
      console.log("data", res.data);
      const heartElement = this.heart; // named elements can be accessed from the parent element
      const isHearted = heartElement.classList.toggle("heart__button--hearted");
      $(".heart-count").textContent = res.data.hearts.length; // new length of users hearts array;
      if (isHearted) {
        const HEART_ANIMATION_CLASS = "heart__button--float";
        heartElement.classList.add(HEART_ANIMATION_CLASS);
        setTimeout(() => {
          // 2.5 seconds will remove the class because the invisible hearts cause click issues
          heartElement.classList.remove(HEART_ANIMATION_CLASS);
        }, 1000 * 2.5);
      }
    })
    .catch(e => {
      console.error(`ajaxHeart failed: ${e}`);
    });
}

export default ajaxHeart;
