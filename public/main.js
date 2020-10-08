window.onerror = function(error) {
  alertify.error("Se detecto un error");
};
    
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

var defTableSettings = {
  ajax: {
    type: "GET",
    url: "http://161.97.81.226:7070/get_logs/",
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
        "Bearer " + localStorage.getItem("token")
      );
    },
    dataSrc: function (json) {
      var filas = json.data.map(function (v) {
        jsparsed = JSON.parse(v.json_log);
        flattened = flattenObject(jsparsed);

        return {
          canal: v.canal,
          usr: v.usr_receptor,
          fecha: v.date,
          tiempo: jsparsed.tiempo,
          lectura: jsparsed.Inner.find((element) => element.fase == "R").tiempo,
          escritura: jsparsed.Inner.find((element) => element.fase == "W")
            .tiempo,
          tarea: jsparsed.Inner.find((element) => element.fase == "T").tiempo,
         /* tareaT1: jsparsed.Inner.find((element) => element.Inner.fase == "T.1").tiempo  */
        };
      });
      return filas;
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      console.log("XHR ERROR Get_DialogChatStatus" + XMLHttpRequest.status);
    },
  },

  columns: [
    {
      title: "Canal",
      data: "canal",
    },
    {
      title: "Celular",
      data: "usr",
    },
    {
      title: "Fecha",
      data: "fecha",
    },
    {
      title:
        "Tiempo total" +
        "<button class='btnExpandTotal rounded-circle btn btn-outline-light text-dark border fa fa-plus fa-sm ml-1' ></button>" +
        "<button  class='btnCollapseTotal rounded-circle  btn btn-outline-light text-dark border fa fa-minus fa-sm ml-1'></button>",
      data: "tiempo",
      render: function (data, type, row) {
        return (
          data.toFixed(4) +
          "<button class='btn btn-primary fa fa-line-chart ml-2' data-toggle='modal' data-target='#modalWindow'></button>"
        );
      },
    },
    {
      visible: false,
      title: "Lectura",
      data: "lectura",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
    },
    {
      visible: false,
      title: "Tarea",
      data: "tarea",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
    },
    /* { 
      title: "Tarea",
      data: "tareaT1",
      render: function (data, type, row) {
        return data;
      },
    }, */
    {
      visible: false,
      title: "Escritura",
      data: "escritura",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
    },
  ],
};

var captureDate = function () {
  $("#total, body").on("click", "button.btnFilter", function () {
    var date = new Date(document.lastModified);
    document.getElementById("lblDate").innerHTML = date;
  });
};
captureDate();

$(document).ready(function () {
  var token = "";
  $.ajax({
    type: "POST",
    url: "http://vmi351008.contaboserver.net:5050/authpad/login",
    data: JSON.stringify({ username: "gd_usr", password: "6D14l0g0" }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      localStorage.setItem("token", data.TOKEN);
      token = data.TOKEN;
      table = $("#total").DataTable(defTableSettings);
    },
    error: function (errMsg) {
      alert(errMsg);
    },
  });

  $("#total thead, #average thead").on(
    "click",
    "button.btnExpandTotal",
    function () {

      $(this).toggleClass("fa-minus btnCollapseTotal");
      table.column(4).visible(true);
      table.column(5).visible(true);
      table.column(6).visible(true);
    }
  );
  
  $("#total thead, #average thead").on(
    "click",
    "button.btnCollapseTotal",
    function () {
      table.column(4).visible(false);
      table.column(5).visible(false);
      table.column(6).visible(false);
    }
  );

  $("#total,#average, body").on("click", "button.btnFilter", function () {
    table.ajax.reload(null, false);
    tableAverage.ajax.reload(null, false);
  });
});

var defTableSettingsAverage = {
  ajax: {
    type: "GET",
    url: "http://161.97.81.226:7070/get_logs/",
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
        "Bearer " + localStorage.getItem("token")
      );
    },
    dataSrc: function (json) {
      var countRow = $("#total").DataTable().rows().count();
      columnTiempo = $("#total").DataTable().column(3).data().sum();
      columnLectura = $("#total").DataTable().column(4).data().sum();
      columnEscritura = $("#total").DataTable().column(5).data().sum();
      columnTarea = $("#total").DataTable().column(6).data().sum();
      var filas = json.data.map(function (v) {
        jsparsed = JSON.parse(v.json_log);
        flattened = flattenObject(jsparsed);

        return {
          tiempo: columnTiempo / countRow,
          lectura: columnLectura / countRow,
          escritura: columnEscritura / countRow,
          tarea: columnTarea / countRow,
        };
      });
      return filas;
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      console.log("XHR ERROR Get_DialogChatStatus" + XMLHttpRequest.status);
    },
  },
  columns: [
    {
      title: "Tiempo promedio",
      data: "tiempo",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
    },
    {
      visible: false,
      title: "Lectura",
      data: "lectura",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
    },
    {
      visible: false,
      title: "Tarea",
      data: "tarea",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
    },
    {
      visible: false,
      title: "Escritura",
      data: "escritura",
      render: function (data, type, row) {
        return data.toFixed(4);
      },
    },
  ],
};

$(document).ready(function () {
  var token = "";
  $.ajax({
    type: "POST",
    url: "http://vmi351008.contaboserver.net:5050/authpad/login",
    data: JSON.stringify({ username: "gd_usr", password: "6D14l0g0" }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      localStorage.setItem("token", data.TOKEN);
      token = data.TOKEN;
      tableAverage = $("#average").DataTable(defTableSettingsAverage);
    },
    error: function (errMsg) {
      alert(errMsg);
    },
  });

  $("#total thead, #average thead").on(
    "click",
    "button.btnExpandTotal",
    function () {
      $(this).toggleClass("fa-minus btnCollapseTotal");
      tableAverage.column(1).visible(true);
      tableAverage.column(2).visible(true);
      tableAverage.column(3).visible(true);
    }
  );

  $("#total thead, #average thead").on(
    "click",
    "button.btnCollapseTotal",
    function () {
      tableAverage.column(1).visible(false);
      tableAverage.column(2).visible(false);
      tableAverage.column(3).visible(false);
    }
  );

  $("#modalWindow, body").on("shown.bs.modal", function () {
    let myChart = document.getElementById("myChart").getContext("2d");

    // Global Options
    Chart.defaults.global.defaultFontFamily = "Lato";
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = "#777";

    let massPopChart = new Chart(myChart, {
      type: "pie", // bar, horizontalBar, pie, line, doughnut, radar, polarArea
      data: {
        labels: ["Lectura", "Tarea", "Escritura"],
        datasets: [
          {
            label: "Tiempos",
            data: [
              tableAverage.column(1).data()[1],
              tableAverage.column(2).data()[1],
              tableAverage.column(3).data()[1],
            ],
            //backgroundColor:'green',
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
              "rgba(255, 159, 64, 0.6)",
              "rgba(255, 99, 132, 0.6)",
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
            left: 50,
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
});
