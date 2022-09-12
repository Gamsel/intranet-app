import React, { useState } from "react";

import Paperbase from './Pages/Paperbase.js';

function  App() {
  document.title = "XLEO"
  document.body.onmousedown = e => { if (e.button === 0) return false; };
  return <Paperbase/>;

}

export default  App;