
var flattenObject = function (ob) {
  var toReturn = {};

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if (typeof ob[i] == "object") {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + "." + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};

//GET Ajax
var defTableSettings = {
  ajax: {
    type: "GET",
    url: "http://161.97.81.226:7070/get_logs/",
    //Parametros
    data: function (a) {
      (a.fromDate = moment().format(
        document.getElementById("from_date").value,
        "YYYY-MM-DDTkk:mm"
      )),
        (a.toDate = moment().format(
          document.getElementById("to_date").value,
          "YYYY-MM-DDTkk:mm"
        )),
        (a.TipoLog = "1");
    },
    //Token
    beforeSend: function (request) {
      request.setRequestHeader(
        "Authorization",
        "Bearer " + localStorage.getItem("tokenr")
      );
    },
    //Obtencion de datos
    dataSrc: function (json) {
      var filas = json.data.map(function (v) {
        jsparsed = JSON.parse(v.json_log);
        flattened = flattenObject(jsparsed);

        return {
          canal: v.canal,
          usr: v.usr_receptor,
          //Formato de fecha
          fecha: moment(v.date).format("DD/MM/YY"),
          tiempo: jsparsed.tiempo,
          //Obtencion de las columnas lectura, escritura y tarea
          lectura: jsparsed.Inner.find((element) => element.fase == "R").tiempo,
          escritura: jsparsed.Inner.find((element) => element.fase == "W")
            .tiempo,
          tarea: jsparsed.Inner.find((element) => element.fase == "T").tiempo,
          //Obtencion de los subprocesos de tiempo
          tareaT1: jsparsed.Inner[0].Inner[0].tiempo,
          tareaT2: jsparsed.Inner[0].Inner[1].tiempo,
          tareaT3: jsparsed.Inner[0].Inner[2].tiempo,
          tareaT21: jsparsed.Inner[0].Inner[1].Inner[0].tiempo,
          tareaT22: jsparsed.Inner[0].Inner[1].Inner[1].tiempo,
          tareaT23: jsparsed.Inner[0].Inner[1].Inner[2].tiempo,
          
        };
        
      });
      return filas;
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) { 
      console.log("XHR ERROR get_logs" + XMLHttpRequest.status);
    },
  },
  language: {
    search: "Buscar:",
  },
  //Definicion de columnas
  columns: [
    {
      //0
      width: "10%",
      title: "Canal",
      data: "canal",
    },
    {
      //1
      width: "10%",
      title: "Celular",
      data: "usr",
    },
    {
      //2
      width: "10%",
      title: "Fecha",
      data: "fecha",
    },
    {
      //3
      title:
        "Tiempo" +
        "<button class='btnExpandTotal btn text-dark fa fa-plus fa-sm ml-1' ></button>" +
        "<button  class='btnCollapseTotal  btn text-dark fa fa-minus fa-sm ml-1'></button>",
      data: "tiempo",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
    },
    {
      //4
      visible: false,
      title: "R",
      data: "lectura",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-primary",
    },
    {
      //5
      visible: false,
      title:
        "T" +
        "<button class='btnExpandTask btn text-dark fa fa-plus fa-sm ml-1' ></button>" +
        "<button  class='btnCollapseTask invisible  btn text-dark fa fa-minus fa-sm ml-1'></button>",
      data: "tarea",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //6
      visible: false,
      title: "T.1",
      data: "tareaT1",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //7
      visible: false,
      title:
        "T.2" +
        "<button class='btnExpandTask2 btn text-dark fa fa-plus fa-sm ml-1' ></button>" +
        "<button  class='btnCollapseTask2 invisible  btn text-dark fa fa-minus fa-sm ml-1'></button>",
      data: "tareaT2",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },

    {
      //8
      visible: false,
      title: "T.2.1",
      data: "tareaT21",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //9
      visible: false,
      title: "T.2.2",
      data: "tareaT22",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //10
      visible: false,
      title: "T.2.3",
      data: "tareaT23",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //11
      visible: false,
      title: "T.3",
      data: "tareaT3",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //12
      visible: false,
      title: "W",
      data: "escritura",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-success",
    },
    {
      //13
      //Boton Generar Grafico
      title: "Accion",
      render: function (data, type, row) {
        return "<button class='btnChart btn btn-primary fa fa-line-chart ml-2' data-toggle='modal' data-target='#modalWindow'></button>";
      },
    },
  ],
};

//Capturar la ultima fecha de filtrado
var captureDate = function () {
  $("#total, body").on("click", "button.btnFilter", function () {
    var date = new Date(document.lastModified);
    document.getElementById("lblDate").innerHTML = date;
  });
};
captureDate();

//POST Ajax
$(document).ready(function () {
  var token = "";
  var tokenr = "";
  $.ajax({
    type: "POST",
    url: "http://vmi351008.contaboserver.net:5050/authpad/login",
    data: JSON.stringify({ username: "gd_usr", password: "6D14l0g0" }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    //Token
    success: function (data) {
      /* localStorage.setItem("token", data.TOKEN); */
      localStorage.setItem("tokenr", data.TOKEN_REFRESH);
      /* token = data.TOKEN; */
      tokenr = data.TOKEN_REFRESH;
      table = $("#total").DataTable(defTableSettings);
    },
    error: function (errMsg) {
      alert(errMsg);
    },
  });
  $("#total thead").on(
    "click",
    "button.btnExpandTotal",
    function () {
      $(this).toggleClass("fa-minus btnCollapseTotal");
      table.column(4).visible(true);
      table.column(5).visible(true);
      table.column(12).visible(true);
    }
  );

  $("#total thead").on(
    "click",
    "button.btnCollapseTotal",
    function () {
      table.column(4).visible(false);
      table.column(5).visible(false);
      table.column(6).visible(false);
      table.column(7).visible(false);
      table.column(8).visible(false);
      table.column(9).visible(false);
      table.column(10).visible(false);
      table.column(11).visible(false);
      table.column(12).visible(false);
    }
  );

  $("#total thead,#average thead").on("click", "button.btnExpandTask", function () {
    $(this).toggleClass("fa-minus btnCollapseTask");
    table.column(6).visible(true);
    table.column(7).visible(true);
    table.column(11).visible(true);

    tableAverage.column(4).visible(true);
    tableAverage.column(5).visible(true);
    tableAverage.column(9).visible(true);
  });

  $("#total thead").on("click", "button.btnCollapseTask", function () {
    table.column(6).visible(false);
    table.column(7).visible(false);
    table.column(8).visible(false);
    table.column(9).visible(false);
    table.column(10).visible(false);
    table.column(11).visible(false);

    tableAverage.column(4).visible(false);
    tableAverage.column(5).visible(false);
    tableAverage.column(6).visible(false);
    tableAverage.column(7).visible(false);
    tableAverage.column(8).visible(false);
    tableAverage.column(9).visible(false);
  });

  $("#total thead").on("click", "button.btnExpandTask2", function () {
    $(this).toggleClass("fa-minus btnCollapseTask2");
    table.column(8).visible(true);
    table.column(9).visible(true);
    table.column(10).visible(true);

    tableAverage.column(6).visible(true);
    tableAverage.column(7).visible(true);
    tableAverage.column(8).visible(true);
  });

  $("#total thead").on("click", "button.btnCollapseTask2", function () {
    table.column(8).visible(false);
    table.column(9).visible(false);
    table.column(10).visible(false);

    tableAverage.column(6).visible(false);
    tableAverage.column(7).visible(false);
    tableAverage.column(8).visible(false);
  });
  //Ocultar o visibilizar columnas
  //Filtrado de fechas
  $("#total,#average, body").on("click", "button.btnFilter", function () {
    table.ajax.reload(null, false);
    tableAverage.ajax.reload(null, false);
  });
  //Filtrado por canal
  $("#serch, body").on("keyup", function () {
    table.columns(0).search(this.value).draw();
  });
});

//GET Ajax tabla promedio
var defTableSettingsAverage = {
  ajax: {
    type: "GET",
    url: "http://161.97.81.226:7070/get_logs/",
    //Parametros
    data: function (a) {
      (a.fromDate = moment().format(
        document.getElementById("from_date").value,
        "YYYY-MM-DDTkk:mm"
      )),
        (a.toDate = moment().format(
          document.getElementById("to_date").value,
          "YYYY-MM-DDTkk:mm"
        )),
        (a.TipoLog = "1");
    },
    beforeSend: function (request) {
      request.setRequestHeader(
        "Authorization",
        "Bearer " + localStorage.getItem("tokenr")
      );
    },
    //Calculo de promedio
    dataSrc: function (json) {
      var countRow = $("#total").DataTable().rows().count();
      columnTiempo = $("#total").DataTable().column(3).data().sum();
      columnLectura = $("#total").DataTable().column(4).data().sum();
      columnEscritura = $("#total").DataTable().column(12).data().sum();
      columnTarea = $("#total").DataTable().column(5).data().sum();
      columnTarea1 = $("#total").DataTable().column(6).data().sum();
      columnTarea2 = $("#total").DataTable().column(7).data().sum();
      columnTarea21 = $("#total").DataTable().column(8).data().sum();
      columnTarea22 = $("#total").DataTable().column(9).data().sum();
      columnTarea23 = $("#total").DataTable().column(10).data().sum();
      columnTarea3 = $("#total").DataTable().column(11).data().sum();


      var filas = json.data.slice(0, 1).map(function () {
        return {
          tiempo: columnTiempo / countRow,
          lectura: columnLectura / countRow,
          escritura: columnEscritura / countRow,
          tarea: columnTarea / countRow,
          tarea1:columnTarea1 / countRow,
          tarea2:columnTarea2 / countRow,
          tarea21:columnTarea21 / countRow,
          tarea22:columnTarea22 / countRow,
          tarea23:columnTarea23 / countRow,
          tarea3:columnTarea3 / countRow,
        };
      });
      return filas;
    },

    error: function (XMLHttpRequest, textStatus, errorThrown) {
      console.log("XHR ERROR get_logs" + XMLHttpRequest.status);
    },
  },
  searching: false,
  info: false,
  paging: false,
  ordering: false,
  //Definicion de columnas de la tabla promedio
  columns: [
    {
      //0
      visible: false,
      width: "30%",
      title: "",
      render: function (data, type, row) {
        return "";
      },
    },

    {
      //1
      width: "23%",
      title: "Tiempos promedio",
      data: "tiempo",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
    },
    {
      //2
      visible: false,
      width: "10%",
      title: "R",
      data: "lectura",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-primary",
    },

    {
      //3
      visible: false,
      width: "15%",
      title: "T",
      data: "tarea",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //4
      visible: false,
      title: "T.1",
      data: "tarea1",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //5
      visible: false,
      title: "T.2",
      data: "tarea2",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //6
      visible: false,
      title: "T.2.1",
      data: "tarea21",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //7
      visible: false,
      title: "T.2.2",
      data: "tarea22",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //8
      visible: false,
      title: "T.2.3",
      data: "tarea23",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //9
      visible: false,
      title: "T.3",
      data: "tarea3",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-danger",
    },
    {
      //10
      visible: false,
      title: "W",
      data: "escritura",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
      className: "text-success",
    },
    {
      width: "6%",
      title: "Accion",
      render: function (data, type, row) {
        return "<button class='btnChart btn btn-primary fa fa-line-chart ml-2' data-toggle='modal' data-target='#modalWindowAverage'></button>";
      },
    },
  ],
};

//POST Ajax de la tabla promedio
$(document).ready(function () {
  var token = "";
  var tokenr = "";
  $.ajax({
    type: "POST",
    url: "http://vmi351008.contaboserver.net:5050/authpad/login",
    data: JSON.stringify({ username: "gd_usr", password: "6D14l0g0" }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    //Token
    success: function (data) {
      /* localStorage.setItem("token", data.TOKEN); */
      localStorage.setItem("tokenr", data.TOKEN_REFRESH);
     /*  token = data.TOKEN; */
      tokenr = data.TOKEN_REFRESH;
      tableAverage = $("#average").DataTable(defTableSettingsAverage);
    },
    error: function (errMsg) {
      alert(errMsg);
    },
  });
 //Ocultar o visibilizar columnas
  $("#total thead, #average thead").on(
    "click",
    "button.btnExpandTotal",
    function () {
      $(this).toggleClass("fa-minus btnCollapseTotal");
      tableAverage.column(0).visible(true);
      tableAverage.column(2).visible(true);
      tableAverage.column(3).visible(true);
      tableAverage.column(10).visible(true);
    }
  );
  //Ocultar o visibilizar columnas
  $("#total thead, #average thead").on(
    "click",
    "button.btnCollapseTotal",
    function () {
      tableAverage.column(0).visible(false);
      tableAverage.column(2).visible(false);
      tableAverage.column(3).visible(false);
      tableAverage.column(10).visible(false);
    }
  );

  //#region Grafico Lectura, Tarea, Escritura
  $("#modalWindow, body").on("shown.bs.modal", function (e) {
    //Captura la fila seleccionada y genera el grafico dependiendo de la seleccion
    var clickedBtn = $(e.relatedTarget);
    var tr = $(clickedBtn).closest("tr");
    var dataLec = table.row(tr).data()["lectura"];
    var dataEsc = table.row(tr).data()["escritura"];
    var dataTar = table.row(tr).data()["tarea"];

    let myChart = document.getElementById("myChart").getContext("2d");
    Chart.controllers.MyType = Chart.DatasetController.extend({});

    // Global Options

    Chart.defaults.global.defaultFontFamily = "Lato";
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = "#777";

    let massPopChart = new Chart(myChart, {
      type: "bar", // bar, horizontalBar, pie, line, doughnut, radar, polarArea
      data: {
        labels: ["Lectura", "Tarea", "Escritura"],
        datasets: [
          {
            label: "Barra",
            data: [dataLec, dataTar, dataEsc],
            backgroundColor: [
              "rgba(37, 179, 179, 0.6)",
              "rgba(255, 99, 132, 0.6)",
              "rgba(72, 161, 36, 0.6)",
              "rgba(37, 179, 179, 0.6)",
              "rgba(255, 99, 132, 0.6)",
              "rgba(72, 161, 36, 0.6)",
            ],
            borderWidth: 1,
            borderColor: "#777",
            hoverBorderWidth: 3,
            hoverBorderColor: "#000",
            order: 1,
          },
        ],
      },

      options: {
        title: {
          display: true,
          fontSize: 25,
        },
        legend: {
          display: true,
          position: "right",
          labels: {
            fontColor: "#000",
          },
        },
        layout: {
          padding: {
            left: 10,
            right: 0,
            bottom: 0,
            top: 0,
          },
        },
        tooltips: {
          enabled: true,
        },
      },
    });
  });
  //#endregion
  //#region Grafico Tarea 1,2,3
  $("#modalTask, body").on("shown.bs.modal", function (e) {
    //Captura la fila seleccionada y genera el grafico dependiendo de la seleccion
    var clickedBtn = $(e.relatedTarget);
    var tr = $(clickedBtn).closest("tr");
    var dataTar1 = table.row(tr).data()["tareaT1"];
    var dataTar2 = table.row(tr).data()["tareaT2"];
    var dataTar3 = table.row(tr).data()["tareaT3"];

    let myChartTask = document.getElementById("myChartTask").getContext("2d");
    Chart.controllers.MyType = Chart.DatasetController.extend({});

    // Global Options
    Chart.defaults.global.defaultFontFamily = "Lato";
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = "#777";

    let massPopChartTask = new Chart(myChartTask, {
      type: "bar", // bar, horizontalBar, pie, line, doughnut, radar, polarArea
      data: {
        labels: ["Tarea 1", "Tarea 2", "Tarea 3"],
        datasets: [
          {
            label: "Tiempos",
            data: [dataTar1, dataTar2, dataTar3],
            //backgroundColor:'green',
            backgroundColor: [
              "rgba(37, 179, 179, 0.6)",
              "rgba(255, 99, 132, 0.6)",
              "rgba(72, 161, 36, 0.6)",
              "rgba(37, 179, 179, 0.6)",
              "rgba(255, 99, 132, 0.6)",
              "rgba(72, 161, 36, 0.6)",
            ],
            borderWidth: 1,
            borderColor: "#777",
            hoverBorderWidth: 3,
            hoverBorderColor: "#000",
          },
        ],
      },
      options: {
        title: {
          display: true,
          fontSize: 25,
        },
        legend: {
          display: true,
          position: "right",
          labels: {
            fontColor: "#000",
          },
        },
        layout: {
          padding: {
            left: 10,
            right: 0,
            bottom: 0,
            top: 0,
          },
        },
        tooltips: {
          enabled: true,
        },
      },
    });
  });
  //#endregion
  //#region Grafico Tarea 2.1, 2.2, 2.3
  $("#modalTask2, body").on("shown.bs.modal", function (e) {
    //Captura la fila seleccionada y genera el grafico dependiendo de la seleccion
    var clickedBtn = $(e.relatedTarget);
    var tr = $(clickedBtn).closest("tr");
    var dataTar21 = table.row(tr).data()["tareaT21"];
    var dataTar22 = table.row(tr).data()["tareaT22"];
    var dataTar23 = table.row(tr).data()["tareaT23"];

    let myChartTask2 = document.getElementById("myChartTask2").getContext("2d");
    Chart.controllers.MyType = Chart.DatasetController.extend({});

    // Global Options
    Chart.defaults.global.defaultFontFamily = "Lato";
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = "#777";

    let massPopChartTask = new Chart(myChartTask2, {
      type: "bar", // bar, horizontalBar, pie, line, doughnut, radar, polarArea
      data: {
        labels: ["Tarea 2.1", "Tarea 2.2", "Tarea 2.3"],
        datasets: [
          {
            label: "Tiempos",
            data: [dataTar21, dataTar22, dataTar23],
            //backgroundColor:'green',
            backgroundColor: [
              "rgba(37, 179, 179, 0.6)",
              "rgba(255, 99, 132, 0.6)",
              "rgba(72, 161, 36, 0.6)",
              "rgba(37, 179, 179, 0.6)",
              "rgba(255, 99, 132, 0.6)",
              "rgba(72, 161, 36, 0.6)",
            ],
            borderWidth: 1,
            borderColor: "#777",
            hoverBorderWidth: 3,
            hoverBorderColor: "#000",
          },
        ],
      },
      options: {
        title: {
          display: true,
          fontSize: 25,
        },
        legend: {
          display: true,
          position: "right",
          labels: {
            fontColor: "#000",
          },
        },
        layout: {
          padding: {
            left: 10,
            right: 0,
            bottom: 0,
            top: 0,
          },
        },
        tooltips: {
          enabled: true,
        },
      },
    });
  });
  //#endregion
  //#region Grafico Promedios
  $("#modalWindowAverage, body").on("shown.bs.modal", function (e) {
    //Captura la fila seleccionada y genera el grafico dependiendo de la seleccion
    var clickedBtn = $(e.relatedTarget);
    var tr = $(clickedBtn).closest("tr");
    var dataLecAv = tableAverage.row(tr).data()["lectura"];
    var dataEscAv = tableAverage.row(tr).data()["escritura"];
    var dataTarAv = tableAverage.row(tr).data()["tarea"];

    let myChartAverage = document
      .getElementById("myChartAverage")
      .getContext("2d");
    Chart.controllers.MyType = Chart.DatasetController.extend({});

    // Global Options
    Chart.defaults.global.defaultFontFamily = "Lato";
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = "#777";

    let massPopChart = new Chart(myChartAverage, {
      type: "bar", // bar, horizontalBar, pie, line, doughnut, radar, polarArea
      data: {
        labels: ["Lectura", "Tarea", "Escritura"],
        datasets: [
          {
            label: "Tiempos",
            data: [dataLecAv, dataTarAv, dataEscAv],
            backgroundColor: [
              "rgba(37, 179, 179, 0.6)",
              "rgba(255, 99, 132, 0.6)",
              "rgba(72, 161, 36, 0.6)",
              "rgba(37, 179, 179, 0.6)",
              "rgba(255, 99, 132, 0.6)",
              "rgba(72, 161, 36, 0.6)",
            ],
            borderWidth: 1,
            borderColor: "#777",
            hoverBorderWidth: 3,
            hoverBorderColor: "#000",
          },
        ],
      },

      options: {
        title: {
          display: true,
          fontSize: 25,
        },
        legend: {
          display: true,
          position: "right",
          labels: {
            fontColor: "#000",
          },
        },
        layout: {
          padding: {
            left: 10,
            right: 0,
            bottom: 0,
            top: 0,
          },
        },
        tooltips: {
          enabled: true,
        },
      },
    });
  });
  //#endregion
});
