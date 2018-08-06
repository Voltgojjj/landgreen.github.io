// https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS

function funGraphSVG(
  id,
  func,
  {
    x0 = 0, // center point x, unscaled
    y0 = 0, // center point y, unscaled
    step = 1,
    scale = 100,
    strokeWidth = 1,
    showFunction = true,
    stroke = "#07b",
    fill = "none",
    showAxis = true, //also disables labels, axisNUmbers and grid
    showLabels = true,
    xLabel = "",
    yLabel = "",
    showAxisNumbers = true,
    precision = 3,
    showGrid = true,
    gridSize = 100, //spacing relative to canvas size
    updatePath = false, //used for changing the equation of the function
    showMouseCoords = false,
    recenterOnClick = false
  } = {}
) {
  const target = document.getElementById(id);
  const bounds = target.getBoundingClientRect();

  if (showAxis) {
    const x = x0 + 0.5; //sharper lines, not between pixels
    const y = y0 + 0.5; //sharper lines, not between pixels

    if (showGrid) {
      let path = "";
      // positive horizontal marks
      for (let i = 1; i * gridSize < bounds.width - x; ++i) {
        const xPos = x + i * gridSize;
        path += `M ${xPos} 0  v ${bounds.height}`;
      }
      // negative horizontal marks
      for (let i = -1; i * gridSize > -x; --i) {
        const xPos = x + i * gridSize;
        path += `M ${xPos} 0  v ${bounds.height}`;
      }
      // positive vertical marks
      for (let i = 1; i * gridSize < y; ++i) {
        const yPos = y - i * gridSize;
        path += `M 0 ${yPos}  h ${bounds.width}`;
      }
      // negative vertical marks
      for (let i = -1; i * gridSize > -bounds.height + y; --i) {
        const yPos = y - i * gridSize;
        path += `M 0 ${yPos}  h ${bounds.width}`;
      }
      const newElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
      newElement.setAttribute("d", path);
      newElement.style.stroke = "#eee";
      newElement.style.fill = "none";
      newElement.style.strokeWidth = 1;
      target.appendChild(newElement);
    }
    //draw Axis
    let path = `M ${x} ${0} L ${x} ${bounds.height} M ${0} ${y} L ${bounds.width} ${y}`;
    //add path to SVG
    const newElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    newElement.setAttribute("d", path);
    newElement.style.stroke = "#000";
    newElement.style.fill = "none";
    newElement.style.strokeWidth = 1;
    target.appendChild(newElement);
    //label axis with tick marks and values at gridSize increments
    if (showAxisNumbers) {
      function addText(text, x, y, { textAnchor = "middle", fontSize = "12", rotation = 0, fill = "#000" } = {}) {
        const newElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        newElement.setAttribute("x", x);
        newElement.setAttribute("y", y);
        newElement.style.fill = fill;
        newElement.style.fontSize = fontSize;
        newElement.style.textAnchor = textAnchor;
        if (rotation) {
          newElement.setAttribute("transform", `rotate(${rotation}, ${x}, ${y})`);
        }
        // newElement.style.fontFamily = "Arial";
        newElement.textContent = text.toString();
        target.appendChild(newElement);
      }

      let path = "";
      // positive horizontal marks
      for (let i = 1; i * gridSize < bounds.width - x; ++i) {
        const xPos = x + i * gridSize;
        const yPos = y;
        path += `M ${xPos} ${yPos}  v 3`;
        addText((x0 + (i * gridSize) / scale - x0).toPrecision(precision), xPos, yPos + 15);
      }
      // negative horizontal marks
      for (let i = -1; i * gridSize > -x; --i) {
        const xPos = x + i * gridSize;
        const yPos = y;
        path += `M ${xPos} ${yPos}  v 3`;
        addText((x0 + (i * gridSize) / scale - x0).toPrecision(precision), xPos, yPos + 15);
      }
      // positive vertical marks
      for (let i = 1; i * gridSize < y; ++i) {
        const xPos = x;
        const yPos = y - i * gridSize;
        path += `M ${xPos} ${yPos}  h -3`;
        addText((x0 + (i * gridSize) / scale - x0).toPrecision(precision), xPos - 5, yPos + 4, { textAnchor: "end" });
      }
      // negative vertical marks
      for (let i = -1; i * gridSize > -bounds.height + y; --i) {
        const xPos = x;
        const yPos = y - i * gridSize;
        path += `M ${xPos} ${yPos}  h -3`;
        addText((x0 + (i * gridSize) / scale - x0).toPrecision(precision), xPos - 5, yPos + 4, { textAnchor: "end" });
      }
      const newElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
      newElement.setAttribute("d", path);
      newElement.style.stroke = "#000";
      newElement.style.fill = "none";
      newElement.style.strokeWidth = 1;
      target.appendChild(newElement);
    }

    if (showLabels) {
      addText(xLabel, bounds.width, y0 - 3, { textAnchor: "end" });
      addText(yLabel, x0 + 13, 0, { textAnchor: "end", rotation: -90 });
    }
  }

  //build a path for the function by calculating each pixel's y-value for each x-value
  if (showFunction) {
    let xx, yy, path;
    for (let i = Math.floor(-x0 / step), len = Math.floor((bounds.width - x0) / step); i <= len; i++) {
      xx = step * i;
      yy = scale * func(xx / scale);
      if (isFinite(yy)) {
        if (path === undefined) {
          path = `M ${x0 + xx} ${y0 - yy}`;
        } else {
          path += ` L ${x0 + xx} ${y0 - yy}`;
        }
      }
    }
    if (updatePath) {
      document.getElementById(id + "-path").setAttribute("d", path);
    } else {
      //add path to SVG
      const newElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
      newElement.setAttribute("id", id + "-path");
      newElement.setAttribute("d", path);
      newElement.style.stroke = stroke;
      newElement.style.fill = fill;
      newElement.style.strokeWidth = strokeWidth;
      newElement.style.strokeLinecap = "round";
      target.appendChild(newElement);
    }
  }

  //mouse over show value of function
  if (showMouseCoords) {
    //add circle
    const newElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    newElement.setAttribute("id", id + "-circle");
    newElement.setAttribute("cx", 0);
    newElement.setAttribute("cy", 0);
    newElement.setAttribute("r", strokeWidth + 2);
    newElement.style.display = "none";
    newElement.style.fill = stroke; //set fill to stroke color for function
    target.appendChild(newElement);

    //add text
    const newTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    newTextElement.setAttribute("id", id + "-coords");
    newTextElement.setAttribute("x", 0);
    newTextElement.setAttribute("y", 0);
    newTextElement.style.fill = stroke;
    newTextElement.style.fontSize = 12;
    newTextElement.style.textAnchor = "start";
    // newTextElement.style.fontFamily = "Arial";
    // newTextElement.textContent = " ".toString();
    target.appendChild(newTextElement);

    //circle hides when mouse leaves the graph
    target.addEventListener("mouseleave", event => {
      document.getElementById(id + "-circle").style.display = "none";
      document.getElementById(id + "-coords").style.display = "none";
    });
    target.addEventListener("mouseenter", event => {
      document.getElementById(id + "-circle").style.display = "block";
      document.getElementById(id + "-coords").style.display = "block";
    });

    //mouse circle on mouse move
    target.addEventListener("mousemove", event => {
      let rect = target.getBoundingClientRect();
      let mouse = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      //move circle to mouse location
      const yPos = y0 - scale * func((mouse.x - x0) / scale);
      if (isFinite(yPos)) {
        document.getElementById(id + "-circle").setAttribute("cx", mouse.x);
        document.getElementById(id + "-circle").setAttribute("cy", yPos);
        //move text to mouse location
        document.getElementById(id + "-coords").setAttribute("x", mouse.x + 5);
        document.getElementById(id + "-coords").setAttribute("y", yPos - 10);
        document.getElementById(id + "-coords").textContent = `(${((mouse.x - x0) / scale).toPrecision(3)}, ${((y0 - yPos) / scale).toPrecision(
          3
        )})`.toString();
      }
    });
  }

  function removeAll() {
    //remove all elements in SVG
    while (target.lastChild) {
      target.removeChild(target.lastChild);
    }
    // remove all event listeners in SVG
    var clone = target.cloneNode();
    while (target.firstChild) {
      clone.appendChild(target.lastChild);
    }
    target.parentNode.replaceChild(clone, target);
  }

  if (recenterOnClick) {
    target.addEventListener("click", event => {
      let rect = target.getBoundingClientRect();
      let mouse = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      removeAll();
      //redraw with the same parameters
      funGraphSVG(id, func, {
        x0: x0 - (mouse.x - bounds.width / 2),
        y0: y0 - (mouse.y - bounds.height / 2),
        step: step,
        scale: scale,
        strokeWidth: strokeWidth,
        showFunction: showFunction,
        stroke: stroke,
        fill: fill,
        showAxis: showAxis,
        showLabels: showLabels,
        xLabel: xLabel,
        yLabel: yLabel,
        showAxisNumbers: showAxisNumbers,
        precision: precision,
        showGrid: showGrid,
        gridSize: gridSize,
        updatePath: updatePath,
        showMouseCoords: showMouseCoords,
        recenterOnClick: recenterOnClick
      });
    });
  }
}