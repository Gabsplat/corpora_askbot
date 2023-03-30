const { GoogleSpreadsheet } = require("google-spreadsheet");

// Funciones de Sheets

async function getSheetsData() {
  const SHEET_ID = "1a-bGGxT7mtc6MT2AXzmSN-Q7YBNnLpfskg1zmliM3KI";
  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  await doc.loadInfo();
  const sheetInversores = doc.sheetsByIndex[2];
  const sheetExpensas = doc.sheetsByIndex[3];

  const rowsInversoresSheet = await sheetInversores.getRows();
  const rowsInversores = rowsInversoresSheet.map((row) => {
    return {
      inversorid: row.inversorid,
      nombre: row.nombre,
      apellido: row.apellido,
      montoinversiondesde: row.montoinversiondesde,
      montoinversionhasta: row.montoinversionhasta,
      fuentecontactoid: row.fuentecontactoid,
      estadoinversorid: row.estadoinversorid,
    };
  });

  const rowsExpensasSheet = await sheetExpensas.getRows();
  const rowsExpensas = rowsExpensasSheet.map((row) => {
    return {
      inversorid: row.inversorid,
      tipo: row.tipo,
      tipomovimientoid: row.tipomovimientoid,
      fecha: row.fecha,
      monto: row.monto,
      monedamonto: row.monedamonto,
      franquiciaid: row.franquiciaid,
      rubroid: row.rubroid,
      subrubroid: row.subrubroid,
    };
  });

  return { rowsInversores, rowsExpensas };
}

export async function getProcessedData() {
  const { rowsInversores, rowsExpensas } = await getSheetsData();
  const inversores = rowsInversores.map((rowInversor) => {
    const relatedExpensesRow = rowsExpensas.filter(
      (rowExpensa) => rowExpensa.inversorid === rowInversor.inversorid
    );
    return {
      ...rowInversor,
      expensas: relatedExpensesRow.length > 0 ? relatedExpensesRow : null,
    };
  });

  const rows = {
    inversores,
    expensas: rowsExpensas,
  };

  return rows;
}

function getAparicionesFuenteContacto(rowsInversores) {
  const countByFuentecontactoid = rowsInversores.reduce((acc, row) => {
    const fuentecontactoid = row.fuentecontactoid;
    if (!acc[fuentecontactoid]) {
      acc[fuentecontactoid] = 0;
    }
    acc[fuentecontactoid]++;
    return acc;
  }, {});
  return countByFuentecontactoid;
}

function getAparicionesEstadoInversor(rowsInversores) {
  const countByEstadoinversorid = rowsInversores.reduce((acc, row) => {
    const estadoinversorid = row.estadoinversorid;
    if (!acc[estadoinversorid]) {
      acc[estadoinversorid] = 0;
    }
    acc[estadoinversorid]++;
    return acc;
  }, {});
  return countByEstadoinversorid;
}

function getAparicionesFranquicia(rowsExpensas) {
  const countByFranquiciaid = rowsExpensas.reduce((acc, row) => {
    const franquiciaid = row.franquiciaid;
    if (!acc[franquiciaid]) {
      acc[franquiciaid] = 0;
    }
    acc[franquiciaid]++;
    return acc;
  }, {});
  return countByFranquiciaid;
}

function getAparicionesTipoMovimiento(rowsExpensas) {
  const countByTipomovimientoid = rowsExpensas
    .filter((row) => row.franquiciaid !== "NULL")
    .reduce((acc, row) => {
      const tipomovimientoid = row.tipomovimientoid;
      if (!acc[tipomovimientoid]) {
        acc[tipomovimientoid] = 0;
      }
      acc[tipomovimientoid]++;
      return acc;
    }, {});

  return countByTipomovimientoid;
}

function getMontoTotalIngresos(rowsExpensas) {
  const montoTotalIngresos = rowsExpensas.reduce((acc, row) => {
    if (row.tipo === "Ingreso") {
      acc += parseInt(row.monto);
    }
    return acc;
  }, 0);
  return montoTotalIngresos;
}

function getMontoTotalEgresos(rowsExpensas) {
  const montoTotalEgresos = rowsExpensas.reduce((acc, row) => {
    if (row.tipo === "Egreso") {
      acc += parseInt(row.monto);
    }
    return acc;
  }, 0);
  return montoTotalEgresos;
}

// Funciones de párrafos

function getParrafosInversores(rowsInversores) {
  const parrafosInversores = rowsInversores.map((rowInversor) => {
    let parrafo = `El inversor ${rowInversor.nombre} ${rowInversor.apellido} esta dispuesto a invertir desde ${rowInversor.montoinversiondesde} hasta ${rowInversor.montoinversionhasta}, su fuente de contacto es ${rowInversor.fuentecontactoid} y su estado de inversor es ${rowInversor.estadoinversorid}. `;
    if (rowInversor.expensas) {
      let parrafoExpensas = rowInversor.expensas.map((row) => {
        return `Un ingreso del inversor registrado es de tipo ${
          row.tipomovimientoid
        } en la fecha ${
          row.fecha
        }, la franquicia en la que registro el ingreso fue ${
          row.franquiciaid
        } y el monto fue de ${row.monto} en ${
          row.monedamonto == "$AR"
            ? "pesos argentinos (ar o ars)"
            : "dolares (usd)"
        }. `;
      });
      parrafo = parrafo + parrafoExpensas.join(" ");
    }
    return parrafo;
  });
  return parrafosInversores;
}

function getParrafosFuenteContacto(rowsInversores) {
  const dataFuenteContacto = getAparicionesFuenteContacto(rowsInversores);
  const parrafosFuenteContacto = Object.keys(dataFuenteContacto).map((key) => {
    return `La fuente de contacto ${key} se repite ${dataFuenteContacto[key]} veces. `;
  });

  return parrafosFuenteContacto;
}

function getParrafosEstadoInversor(rowsInversores) {
  const dataEstadoInversor = getAparicionesEstadoInversor(rowsInversores);
  const parrafosEstadoInversor = Object.keys(dataEstadoInversor).map((key) => {
    return `El estado de inversor ${key} se repite ${dataEstadoInversor[key]} veces. `;
  });

  return parrafosEstadoInversor;
}

function getParrafosFranquicia(rowsExpensas) {
  const dataFranquicia = getAparicionesFranquicia(rowsExpensas);
  const parrafosFranquicia = Object.keys(dataFranquicia).map((key) => {
    return `La franquicia ${key} se repite ${dataFranquicia[key]} veces. `;
  });

  return parrafosFranquicia;
}

function getParrafosTipoMovimiento(rowsExpensas) {
  const dataTipoMovimiento = getAparicionesTipoMovimiento(rowsExpensas);
  const parrafosTipoMovimiento = Object.keys(dataTipoMovimiento).map((key) => {
    return `El tipo de movimiento ${key} se repite ${dataTipoMovimiento[key]} veces. `;
  });

  return parrafosTipoMovimiento;
}

function getParrafosMontoTotal(rowsExpensas) {
  const montoTotalIngresos = getMontoTotalIngresos(rowsExpensas);
  const montoTotalEgresos = getMontoTotalEgresos(rowsExpensas);
  const parrafoMontos = `El balance o monto total de ingresos es de ${montoTotalIngresos} y el balance o monto total de egresos es de ${montoTotalEgresos}. `;
  let balanceTotal = 0;
  if (montoTotalIngresos > montoTotalEgresos) {
    balanceTotal = montoTotalIngresos - montoTotalEgresos;
  } else {
    balanceTotal = montoTotalEgresos - montoTotalIngresos;
  }
  const parrafoBalance = `El balance o monto total de expensas (entre ingresos y egresos) es de ${
    montoTotalIngresos - montoTotalEgresos
  }. `;
  return [parrafoMontos, parrafoBalance];
}

function getParrafosEgresos(rowsExpensas) {
  const parrafosEgresos = rowsExpensas
    .filter((row) => row.tipo === "Egreso")
    .map((row) => {
      let parrafo = `Un egreso es para (de tipo) ${row.tipomovimientoid} en la fecha ${row.fecha}, el rubro del egreso es ${row.rubroid} y el subrubro es ${row.subrubroid}, el monto fue de ${row.monto} en la moneda ${row.monedamonto}. `;
      return parrafo;
    });

  return parrafosEgresos;
}

function getParrafosIngresos(rowsExpensas) {
  const parrafosIngresos = rowsExpensas
    .filter((row) => row.tipo === "Ingreso")
    .map((row) => {
      let parrafo = `Un ingreso es para (de tipo) ${row.tipomovimientoid} en la fecha ${row.fecha}, es de la franquicia ${row.franquiciaid}, el monto fue de ${row.monto} en la moneda ${row.monedamonto}. `;
      return parrafo;
    });

  return parrafosIngresos;
}

export async function getParrafosProcesados() {
  const { inversores, expensas } = await getProcessedData();
  const parrafosInversores = getParrafosInversores(inversores);
  const parrafosEgresos = getParrafosEgresos(expensas);
  const parrafosIngresos = getParrafosIngresos(expensas);
  const parrafosFuenteContacto = getParrafosFuenteContacto(inversores);
  const parrafosEstadoInversor = getParrafosEstadoInversor(inversores);
  const parrafosFranquicia = getParrafosFranquicia(expensas);
  const parrafosTipoMovimiento = getParrafosTipoMovimiento(expensas);
  const parrafosMontoTotal = getParrafosMontoTotal(expensas);

  return [
    ...parrafosInversores,
    ...parrafosEgresos,
    ...parrafosIngresos,
    ...parrafosFuenteContacto,
    ...parrafosEstadoInversor,
    ...parrafosFranquicia,
    ...parrafosTipoMovimiento,
    ...parrafosMontoTotal,
  ];
}
