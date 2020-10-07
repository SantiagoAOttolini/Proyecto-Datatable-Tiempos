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
    //"url": '/ControlPanel/GetChatStatusForExperience/' + expIdTC,
    url: "http://161.97.81.226:7070/get_logs/", //+ '?fromDate=2020-09-16T15:51:58&toDate=2020-09-17&TipoLog=1',
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
    /* moment().format("2020-09-01T10:51:58","YYYY-MM-DDTkk:mm") */
    beforeSend: function (request) {
      request.setRequestHeader(
        "Authorization",
        "Bearer " + localStorage.getItem("token")
      );
    },
    dataSrc: function (json) {
      var filas = json.data.map(function (v) {
        jsparsed = JSON.parse(v.json_log);
        flattened = flattenObject(jsparsed); //ejemplo no necesario por el momento

        return {
          canal: v.canal, // a modo de ejemplo
          usr: v.usr_receptor,
          fecha: v.date,
          tiempo: jsparsed.tiempo,
          lectura: jsparsed.Inner.find((element) => element.fase == "R").tiempo,
          escritura: jsparsed.Inner.find((element) => element.fase == "W")
            .tiempo,
          tarea: jsparsed.Inner.find((element) => element.fase == "T").tiempo,
          //"flattened": flattened  // a modo de ejemplo
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
        "<button  class='btnCollapseTotal invisible rounded-circle  btn btn-outline-light text-dark border fa fa-minus fa-sm ml-1'></button>",
      data: "tiempo",
      render: function (data, type, row) {
        return (
          data.toFixed(3) +
          "<button class='btn btn-primary fa fa-line-chart ml-2' data-toggle='modal' data-target='#modalWindow'></button>"
        );
      },
    },
    {
      visible: false,
      title: "Lectura",
      data: "lectura",
      render: function (data, type, row) {
        return data.toFixed(3);
      },
    },
    {
      visible: false,
      title: "Tarea",
      data: "tarea",
      render: function (data, type, row) {
        return data;
      },
    },
    {
      visible: false,
      title: "Escritura",
      data: "escritura",
      render: function (data, type, row) {
        return data.toFixed(3);
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
      //getLogs(token);
      table = $("#total").DataTable(defTableSettings);
    },
    error: function (errMsg) {
      alert(errMsg);
    },
  });

  $("#total thead").on("click", "button.btnExpandTotal", function () {
    $(this).toggleClass("fa-minus btnCollapseTotal");
    table.column(4).visible(true);
    table.column(5).visible(true);
    table.column(6).visible(true);
  });
  $("#total thead").on("click", "button.btnCollapseTotal", function () {
    table.column(4).visible(false);
    table.column(5).visible(false);
    table.column(6).visible(false);
  });

  $("#total, body").on("click", "button.btnFilter", function () {
    var startDate = moment().format(
      document.getElementById("from_date").value,
      "YYYY-MM-DDTkk:mm"
    );
    var endDate = moment().format(
      document.getElementById("to_date").value,
      "YYYY-MM-DDTkk:mm"
    );
    console.log(startDate, endDate);

    table.ajax.reload(null, false);

  });
});
