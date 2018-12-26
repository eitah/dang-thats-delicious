import "../sass/style.scss";

import { $, $$ } from "./modules/bling";

import autocomplete from "./modules/autocomplete";
import typeAhead from "./modules/typeAhead";
import makeMap from "./modules/makeMap";
import ajaxHeart from "./modules/heart";

autocomplete($("#address"), $("#lat"), $("#lng"));
typeAhead($(".search"));
makeMap($("#map"));

const heartForms = $$("form.heart");
// heartForms.on abstracts away the event listener on each heart element; 
heartForms.on('submit', ajaxHeart);
