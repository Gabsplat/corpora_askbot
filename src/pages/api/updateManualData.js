const { GoogleSpreadsheet } = require("google-spreadsheet");
// import { supabase } from "@/server/supabaseClient";
import { PineconeClient } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";
const { Configuration, OpenAIApi } = require("openai");

// Open ai
const configuration = new Configuration({
  apiKey: PROCESS.ENV.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);
const MODEL = "text-embedding-ada-002";

// Pinecone
const pinecone = new PineconeClient();

// Supabase
// const supabaseUrl = "https://mqwsoqczhwoxylzhjgtr.supabase.co";
// const supabaseKey = process.env.SUPABASE_KEY;
// export const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      const data = getParrafosProcesados();
      const response = await upsertToPinecone(data);
      res.status(200).json(response);
      // res.status(200).json({ data: data });
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}

function getParrafosProcesados() {
  const paragraphs = [
    {
      title: "Introducción",
      body: "Un manual de procesos es un documento en el que se visualiza la secuencia de acciones que debes seguir para realizar una actividad. Específicamente, en este manual descubrirás los pasos de los procesos ejecutados en Constructora Colonial. Por eso, encontrarás las instrucciones, modos y estándares a seguir de cada uno. La finalidad del mismo es determinar los procesos de la empresa, respetar los estándares de trabajo, unificar criterios generales y específicos de cada sector, determinar y delimitar perfiles necesarios. De esta manera, se logra optimizar las tareas ejecutadas, reducir costos, ahorrar tiempo y responder de manera eficiente a los clientes ante cualquier requerimiento. La estructura del manual se centra: primero, en encontrar información general para comprender el proceso de Constructora Colonial. Segundo, información detallada de cada proceso. Tercero, las herramientas utilizadas en Constructora. Por último, una conclusión del manual. ",
    },
    {
      title: "Propósito del documento",
      body: "Este manual es un instrumento de trabajo que detalla un conjunto de actividades necesarias para ejecutar una obra. Cuenta con procesos, actividades y tareas relacionadas con el comienzo, ejecución y finalización de una obra. Estas son realizadas por diferentes áreas de Constructora Colonial para realizar los trabajos de una manera eficaz y eficiente por parte de todo el equipo que conforman y desarrollan actividades específicas en Constructora Colonial.  El desempeño y aporte cotidiano en el trabajo según las especificaciones de este manual permitirá el cumplimiento de objetivos y metas establecidas por la gerencia. Y contribuirá al mejoramiento y desarrollo de la empresa. El documento está orientado a ser una guía para los miembros que se incorporan como así también para quienes se desempeñan en Constructora Colonial con cierta antigüedad. En él confluyen herramientas, procesos y criterios que se convierten en facilitadores de la comunicación entre las personas con el objetivo de ejecutar las tareas de forma estandarizada y brindar una experiencia enriquecedora a los miembros de la empresa. De esta manera, a cada miembro se le asignará un perfil definido con las funciones de acuerdo a la estructura organizativa y el tamaño del proyecto. La asignación de las responsabilidades tiene por fin que cada uno logre desenvolverse en Constructora.",
    },
    {
      title: "Ámbito del documento",
      body: "El documento tiene aplicación exclusivamente en la empresa CONSTRUCTORA COLONIAL y cada herramienta utilizada se ajusta a los objetivos y parámetros de la misma.",
    },
    {
      title: "Audiencia objetivo",
      body: "La audiencia objetivo del manual son los miembros actuales de la empresa, quienes participaron activamente del proceso de recolección de información; los profesionales independientes contratados por Colonial para ejecutar tareas específicas; los miembros que se incorporen; la alta gerencia que toma decisiones respecto al funcionamiento de la empresa, la toma de decisiones y el control de Constructora Colonial.",
    },
    {
      title: "Historia",
      body: `Somos una empresa que ha permanecido vigente durante más de 30 años. Un sistema cuidadosamente armado nos ha permitido cumplir sueños a varias generaciones. Nuestra historia habla de nosotros, por eso mencionamos algunos hitos importantes:
      - En 1991, Jorge Allub fundó la empresa, sentando las bases para su éxito futuro. Ese mismo año, se desarrolló el Conjunto Residencial Verde Colonial, que combinaba privacidad, naturaleza y áreas recreativas, estableciendo el ADN de la empresa desde sus inicios.
      A medida que Constructora Colonial crecía, se inauguró el Barrio MEBNA en 1994, ampliando su presencia en el mercado de viviendas. En 1996, nació HÁBITAT 99, un programa diseñado para hacer realidad el sueño de las personas de tener su propia vivienda de forma accesible. También se dio inicio al Barrio San Pablo, otro proyecto que ofrecía opciones de vivienda atractivas.
      El año 2001 presentó desafíos para la constructora, con el fin de la convertibilidad. Sin embargo, Constructora Colonial superó estos obstáculos y continuó creciendo. En ese mismo año, se inauguró el Barrio La Posada, ubicado en el acceso principal a la Ciudad de San Martín, que combinaba el estilo colonial y conceptos de arquitectura moderna. Además, se abrieron las primeras oficinas, fortaleciendo su presencia en el mercado.
      - En 2008, Constructora Colonial desarrolló el Barrio Jardín Colonial, agregando más opciones residenciales a su cartera y expandiendo su influencia. Dos años más tarde, en 2010, evolucionaron con el Plan HÁBITAT 99 PREMIUM, ofreciendo beneficios adicionales a aquellos que buscaban su propia vivienda. También se inauguró Colonial Plaza, el primer edificio de la empresa, y se incorporó a Nicolás al equipo, aportando ideas modernas e innovadoras.
      El año 2011 fue testigo del nacimiento de Colonial Parque, otro proyecto residencial que proporciona comodidad y calidad de vida a sus residentes. En 2014, Constructora Colonial inauguró el espacio "Oeste Shopping", un centro comercial que se convirtió en un punto de referencia para la comunidad y contribuyó al crecimiento económico local.
      Constructora Colonial ha demostrado su compromiso con la sostenibilidad al construir Ecopark en 2015, el primer edificio sustentable en su historia. Ese mismo año, crearon Alto las Bóvedas, otro desarrollo residencial destacado en su cartera.
      - En 2016, Constructora Colonial inició el proyecto Pueblo Nuestro, brindando una experiencia de vida única y una comunidad integrada. Además, asumieron el papel de presidentes de la Comisión de Desarrolladores de la Cámara de la Construcción, contribuyendo activamente al crecimiento y desarrollo de la industria.
      Terrazas de Pueblo Nuestro nació en 2017, y en 2020, Constructora Colonial enfrentó nuevos desafíos debido a la pandemia, la digitalización y el trabajo remoto. Sin embargo, se adaptaron y continuaron generando impacto en el mercado.
      - En 2021, lograron la comercialización completa de Terrazas de Pueblo Nuestro. Al año siguiente, en 2022, reafirmaron su propósito de contribuir a ciudades prósperas, diversas y sostenibles. También inauguraron Casa Club, un multiespacio pensado como punto de encuentro para coworkers, gastronomía y otras experiencias. Además, abrieron oficinas en Pueblo Nuestro y presentaron Deportia, un centro deportivo dentro del desarrollo.
      - El año 2022 marcó un hito importante para Constructora Colonial, ya que establecieron un spin-off llamado Vanwa, que cambió la forma en que se comunicaban y se daban a conocer, fortaleciendo su conexión con las personas. También iniciaron una colaboración con Corpora para optimizar sus procesos y seguir evolucionando en su labor.
      - En el año actual, 2023, Constructora Colonial se enfrenta a nuevos desafíos y espera un crecimiento continuo. A lo largo de su historia, han dejado una marca en la industria de la construcción, destacándose por su enfoque en la calidad, la innovación y la sostenibilidad.
      Con cada hito alcanzado, Constructora Colonial ha demostrado su compromiso con brindar opciones de vivienda accesibles, comunidades integradas y soluciones arquitectónicas modernas. Su trayectoria refleja una empresa que se adapta a los cambios del entorno y busca constantemente generar un impacto positivo en las ciudades donde opera.
      `,
    },
    {
      title: "Valores, bases y principios",
      body: "Son los principios que rigen la misión, visión y el compromiso con los clientes de Constructora Colonial. Pero también son un reflejo de nuestro comportamiento y organización interna. Son nuestra personalidad, son los rasgos y cualidades que nos representan, son nuestra verdad. Determinan la forma de entablar relaciones y la forma de actuar de la empresa con los clientes, proveedores, colegas, competidores, etc. Son algo más que creer. Los valores hacen referencia a creer en algo y vivirlo cada día. Si valoramos algo, creemos que algo vale o tiene importancia nos esforzamos en cultivarlo. Es muy importante conocer y compartir los valores entre los miembros del equipo para comprender la dinámica de equipo, los mismos guían cómo nos relacionamos entre sí.",
    },
    {
      title: "Características de los valores",
      body: "Los valores son elementos fundamentales en una empresa y marcan patrones para la toma de decisiones. Constructora Colonial comprende la importancia de tener valores sólidos que guíen su accionar. Estos valores son coherentes y ajustados con la compañía, reflejando su identidad y propósito. La empresa considera que los valores son indispensables para evitar conflictos entre el personal, ya que proporcionan un marco de referencia común en el cual todos pueden basarse al tomar decisiones. Al compartir y creer en estos valores, los miembros de Constructora Colonial trabajan en armonía, colaborando en el logro de las metas y objetivos empresariales. Además, los valores facilitan la adaptación de los nuevos miembros a la empresa. Al contar con una cultura organizacional sólida y valores claros, se genera un ambiente propicio para que los nuevos integrantes comprendan rápidamente las expectativas y normas de la compañía, fomentando su integración y contribución efectiva desde el inicio. Es fundamental que tanto la empresa como sus miembros posean y crean en estos valores. Constructora Colonial reconoce que estos valores son parte esencial de su ADN y los considera como cimientos para su éxito continuo en la industria de la construcción.",
    },
    {
      title: "Detección",
      body: "Es vital la identificación de los valores corporativos de la empresa porque ellos marcan nuestras acciones, delimitando nuestra estrategia. Los valores no pueden quedar en palabras bonitas, si se escriben hay que actuar en coherencia y en consecuencia.",
    },
    {
      title: "¿Cuáles son los valores en Constructora Colonial?",
      body: `Las bases de nuestra compañía son la confianza y la honestidad, casi todos nuestros compromisos son a futuro y se consolidan tiempo después de que el inversor cumple su parte.
      La responsabilidad es otro de los valores fundamentales que nos rigen, nos dedicamos a administrar capital de terceros con un fin específico, que es el de construir su vivienda. Esa responsabilidad es transversal a todas las áreas de la Constructora de inicio a fin.
      La solidaridad es parte del sentido fundamental de nuestro sistema de financiamiento. Necesitamos amplios grupos de individuos comprometidos con objetivos comunes.
      La empatía al igual que la solidaridad, es una guía para la toma de decisiones difíciles y cruciales de la compañía. Aplica a las relaciones internas y con el cliente.
      La sencillez es la que se ve en nuestra identidad: se ve en nuestras casas, nuestros proyectos, en las personas que los componen. También nos ocupamos de mantener esa misma sencillez a la hora de transmitir información a nuestros clientes como principal desafío diario. 
      Si bien todos estos valores están visiblemente lejos de la mercantilización, no se debe dejar de lado como punto importante el lucro, logrando crecer en nuestro valor de mercado, posicionandonos como líderes en el rubro y buscando generar ingresos que nos permitan crecer. 
      Por último destacamos dos valores que creemos fundamentales: el trabajo en equipo, y la calidad de nuestro producto. El primero es parte de nuestra vocación, buscamos tener una cotidianidad laboral emocionante, creativa y resolutoria. Y la calidad,  nos parece indispensable, queremos clientes conformes y orgullosos de su casa, de su inversión`,
    },
    {
      title: "Equipo",
      body: "Como mencionamos al hablar de nuestra historia y valores, Colonial mezcla la experiencia de sus fundadores con el empuje e innovadoras iniciativas de un equipo de jóvenes profesionales liderados por el CEO de la empresa Nicolás Allub. Este equipo se compone de perfiles que son de gran importancia para el funcionamiento del día a día de Colonial.",
    },
    {
      title: "Roles y perfiles",
      body: `En Constructora Colonial, reconocemos la importancia de contar con perfiles clave en nuestra empresa, que desempeñan roles fundamentales para el funcionamiento y éxito de nuestras operaciones. Estos perfiles abarcan diversas áreas y contribuyen en diferentes aspectos de nuestro negocio, y son los siguientes:
      - Uno de los roles es el Gerente Administrativo Financiero, quien se encarga de supervisar y dirigir las actividades administrativas y financieras de la empresa. Este perfil desempeña un papel crucial en la gestión de los recursos económicos y en la toma de decisiones estratégicas relacionadas con las finanzas.
      - Otro perfil es el Responsable Técnico y Líder de Oficina de Producción. Esta persona es responsable de liderar y coordinar las actividades técnicas y de producción de nuestros proyectos. Su experiencia y conocimientos técnicos son fundamentales para asegurar la calidad y eficiencia en la ejecución de nuestras obras.
      - El Líder de Producto es otro perfil clave en Constructora Colonial. Esta persona se encarga de desarrollar y gestionar nuestros productos inmobiliarios, asegurando que satisfagan las necesidades del mercado y estén alineados con nuestra visión y estrategia empresarial.
      - El Coordinador de Operaciones juega un papel fundamental en la gestión y coordinación de las operaciones diarias de la empresa. Su objetivo es optimizar los procesos y recursos, asegurando la eficiencia y la excelencia en la ejecución de los proyectos.
      - El Responsable Administrativo es responsable de la gestión y supervisión de las actividades administrativas de la empresa. Este perfil se encarga de garantizar el cumplimiento de los procedimientos internos y administrativos, así como de brindar soporte al equipo en aspectos relacionados con la gestión del personal y los recursos.
      - El Asesor Comercial desempeña un papel importante en la relación con nuestros clientes y en la comercialización de nuestros productos. Su objetivo es identificar oportunidades de negocio, establecer relaciones sólidas con los clientes y lograr los objetivos de ventas.
      - El Analista de Performance se encarga de realizar análisis y seguimiento de los indicadores clave de rendimiento de la empresa. Su labor es fundamental para evaluar el desempeño y tomar decisiones informadas para mejorar la eficiencia y la rentabilidad de nuestras operaciones.
      - Otros perfiles clave en Constructora Colonial incluyen al equipo de Tesorería, encargado de la gestión financiera y el flujo de caja; al Encargado de Depósito, responsable de la gestión y control de inventario y almacenamiento; y al Encargado de Compras, quien se encarga de la adquisición y gestión de los materiales y recursos necesarios para nuestros proyectos.
      Buscamos que nuestro equipo sea lo más homogéneo posible, para que pueda funcionar en conjunto y trabajar en pos de darle los mejor a nuestros clientes.`,
    },
    {
      title: "Procesos internos. Criterios - Introducción",
      body: `Detectar procesos implica identificar y gestionar de manera sistemática las actividades desarrolladas en una empresa y la interacción entre ambas actividades mediante vínculos de causa-efecto o secuencia lógica. Consiste en adoptar un sistema basado en la gestión de los procesos. Así se asegura que la empresa cumpla con los objetivos y optimice sus recursos de forma metódica y obtenga la satisfacción de todos los intervinientes, sean internos o externos.
      Determinar los procesos estratégicos permite planificar el servicio y los productos ofrecidos a los clientes y los objetivos internos de la empresa. También representa el funcionamiento estructural base de la empresa. 
      La lógica utilizada para la realización de los flujos se podría describir de la siguiente manera: comenzamos por identificar el proceso objetivo sobre el cual queremos trabajar, luego determinamos las tareas necesarias para alcanzar el objetivo general. A continuación, desglosamos cada tarea en subtareas más específicas y detalladas. A partir de ahí, establecemos el paso a paso del proceso, definiendo la secuencia lógica de las actividades y colocando los conectores correspondientes. Por último, en cada etapa del flujo de trabajo, identificamos la documentación indispensable que se requiere. Este enfoque nos permite tener una visión clara y organizada de los procesos, optimizando la eficiencia y asignando responsabilidades adecuadas en cada paso.`,
    },
    {
      title: "Procesos internos. Criterios - Referencias",
      body: "Inicio y fin de los procesos: rectángulo horizontal con dos líneas verticales, una en cada extremo. Tareas: rectángulo horizontal. Acciones: rombo. Entes externos: hexágono. Plantilla Bitrix: círculo celeste. Alta prioridad: emoji de fuego.",
    },
    {
      title: "Procesos internos. Criterios - Proceso general",
      body: "A fines de mejor entendimiento, hemos organizado el proceso general en base a los subprocesos que se llevan adelante en la empresa. Tenemos así una parte administrativa de obra, a la cual le sigue la faz técnica de la misma, y otra administrativa comercial. Abordaremos de manera general todo el proceso, para luego desmembrarlo en subprocesos.",
    },
    {
      title: "Procesos internos. Criterios - Tipos de procesos",
      body: "Constructora Colonial es una empresa que llevó adelante una fase de exploración de sus procesos internos a los fines de organizar y administrar de manera eficiente sus recursos humanos, materiales y financieros. Resultado de ello, clasifica sus procesos en: Procesos administrativos de obras que incluyen proyecto, loteo y carpeta individual, también tenemos procesos técnicos de obra que incluye la obra de loteo y la obra de vivienda individual y finalmente tenemos el proceso Administrativo-Comercial que incluye lo pertinente a lo contable, comercial y procesos especiales.",
    },
    {
      title: "Procesos internos. Criterios - Procesos administrativos de obra",
      body: "El proceso administrativo es subdividido en 3 subprocesos y abarca tareas administrativas a practicar frente a diferentes organismos. El primer subproceso de tipo interno es denominado 'Proyecto' y comprende la tareas de gestión de un nuevo proyecto. El segundo subproceso 'Loteo' enumera los trámites administrativos respecto a un proyecto aprobado. El tercer subproceso 'Carpeta individual' comprende la confección de los trámites a realizar previos a la edificación de unidades individuales del proyecto aprobado.",
    },
    {
      title:
        "Procesos internos. Criterios - Procesos administrativos de obra - Proyecto",
      body: "Este subproceso comienza con la presentación de propuesta y finaliza con el Proyecto Municipal de Fracción/loteo. Aquí es donde interviene la oficina de producto. Está compuesta por arquitectos y liderada por uno de ellos. Se ocupa del desarrollo de propuestas arquitectónicas. Va desde el anteproyecto hasta el proyecto ejecutivo. El flujo de este sub-proceso comienza con la presentación de la propuesta en donde interactúan tanto el cliente como la gerencia. Posteriormente se debe realizar la presentación de la idea para luego plasmar la misma. Luego le siguen una serie de tareas que son Fracción-Lote, Presentación de alternativas a la gerencia y la evaluación de alternativas antes las cuales posteriormente hay que realizar una elección de una de las alternativas para convertirla en el anteproyecto. Una vez se tiene esto se procede a armar el proyecto municipal y para ello se requiere realizar la documentación ejecutiva de obra y el cómputo y presupuesto de obra. Este presupuesto debe ser enviado a gerencia y a contaduría.",
    },
    {
      title:
        "Procesos internos. Criterios - Procesos administrativos de obra - Loteo",
      body: "Este subproceso comienza con Proyecto Municipal  y finaliza con la aprobación del 'Expediente de urbanización'. El flujo comienza con la  mensura y anteproyecto de loteo, en paralelo a esto aparece la intervención del agrimensor. Estas dos tareas sirven para dar inicio al proceso de armado de un expediente municipal de urbanización, para ello hay que recolectar información y luego elaborar un listado de requisitos. Posteriormente se debe hacer la documentación de cada servicio y a su vez la documentación de 'trámites que no son servicios'. Luego se hace la presentación de cada trámite y se completa el listado con una plantilla de Bitrix. A esto le sigue la aprobación de la carpeta/informe ejecutiva de cada trámite y luego la ejecución e inspección de las obras de servicios y urbanización. Finalmente se obtiene el certificado final de obra logrando la aprobación del loteo.",
    },
    {
      title:
        "Procesos internos. Criterios - Procesos administrativos de obra - Carpeta individual",
      body: "Este subproceso comienza con la confección de expedientes de 'Viviendas individuales' y finaliza con el fin de carpeta 'Expediente de vivienda'. El flujo de la tarea 'Expedientes de 'viviendas individuales' comienza con la confección de expedientes de viviendas individuales, a partir de aquí aparecen dos caminos que hay que transitar, el primero sigue la rama de recolección de carpeta ejecutiva del expediente de urbanización y también la recolección de la aprobación del loteo, este camino termina allí. El otro camino consiste en adjuntar la recolección de documentación con una plantilla, en la misma se incluyen los siguientes documentos: Expediente municipal de construcción con formularios, planos, informe catastral (municipio), también se deben abonar aforos municipales, conformar el expediente y hacer la revisión técnica. Luego se presenta cada carpeta y se realiza un control del avance de cada expediente para obtener finalmente la aprobación de las carpetas.",
    },
    {
      title:
        "Procesos internos. Criterios - Procesos técnicos de obra - Obra de loteo",
      body: "Este subproceso comienza con el proceso constructivo y finaliza con el fin de la urbanización.",
    },
    {
      title:
        "Procesos internos. Criterios - Procesos técnicos de obra - Obra de vivienda individual",
      body: "Este subproceso se inicia con el arranque de obra de vivienda individual con boleta habilitante y finaliza con la entrega de la vivienda. El flujo comienza con el avance de urbanización lo que lleva a la tarea 'Aprobación del loteo', esta tarea comienza con la etapa administrativa de carpeta individual, luego el proceso puede seguir dos caminos según si se tiene o no la boleta habilitante. En caso de tener la boleta se sigue el camino de comenzar la obra de vivienda individual con boleta habilitante, luego se debe hacer la certificación de obra para ello hay dos procesos a realizar, el primero es revisar la obra, armar la certificación, enviar la misma a contaduría para q asi se liberen los pagos a contratistas; el segundo proceso a realizar es para cada avance de obra realizar una inspección para obtener la aprobación definitiva del ente de cada servicio con formularios Aysam, luego llega el fin de la obra de casas individuales con ello hay que realizar el conforme de obra de casas individuales para así poder aprobar el conforme. Terminado esto sigue la instalación de servicios de vivienda individual y la conexión de servicios. Finalmente la tarea termina con la entrega de la vivienda. En caso de no tener la boleta comienza un caso excepcional en donde se comienza la obra sin boleta habilitante, se debe solicitar un relevamiento de obra para aportar el plano de dicho relevamiento y posteriormente solicitar la aprobación a la municipalidad para obtener la aprobación (visación de obra).",
    },
    {
      title: "Procesos internos. Criterios - Proceso administrativo-comercial",
      body: "Este proceso se compone tanto de actividades internas que implican la contabilidad y la gestión de sueldos, así como la gestión comercial en relación al cliente.",
    },
    {
      title:
        "Procesos internos. Criterios - Proceso administrativo-comercial - Contable",
      body: "El proceso contable implica la contabilidad interna de la empresa junto con la contabilidad externa. Dentro de la contabilidad externa subdividimos el proceso en la Gestión de sueldos. Ambos procesos se detallan a continuación. El flujo comienza con la tarea 'Recolección de comprobantes' que se obtienen de Constructora colonial, Emprendimientos urbanos y Asociación mutual. Luego estos se deben volcar al sistema y se deben validar los comprobantes para su procesamiento. También se debe analizar las inconsistencias y armar un balance histórico. La tarea termina con el envío de todo esto al estudio contable.",
    },
    {
      title:
        "Procesos internos. Criterios - Proceso administrativo-comercial - Gestión de sueldos",
      body: "El flujo de la tarea 'Gestión de sueldos' comienza con una división de caminos: el camino de la primera quincena del mes y el camino de la segunda quincena del mes pero a fines prácticos los caminos se unen en dos procesos que están en paralelo: el primero es que el encargado de obra pase la plantilla y el segundo es sumar los sueldos administrativos. Posteriormente estos procesos convergen al envío al área administrativa a lo cual le sigue la confección de bonos de sueldo que son enviados a tesorería, estos hablan con gerencia y finalmente se emiten los pagos.",
    },
    {
      title:
        "Procesos internos. Criterios - Proceso administrativo-comercial - Comercial",
      body: "El proceso comercial incluye todo el proceso de venta, captación del cliente y seguimiento del mismo, atravesando subprocesos tales como el cobro de cuotas y la gestión de reclamos. Los últimos dos procesos se grafican a continuación, mientras que el proceso de venta se detalla en la cuarta parte de EXPERIENCIA DEL CLIENTE.",
    },
    {
      title:
        "Procesos internos. Criterios - Proceso administrativo-comercial - Comercial - Cobro de cuotas",
      body: "El flujo de la tarea ingreso de pagos comienza con una discriminación entre 3 medios de pago: Depósito, Transferencia y Cámara. En caso de que sea por Depósito o transferencia, se emite un comprobante y luego se carga al software. En caso de que sea por cámara, se tiene el comprobante vía mail ante lo cual hay dos caminos que se puede seguir, el primero es guardar el comprobante digital, luego adjuntar un archivo PDF y cargarlo al software. El segundo camino es imprimir el comprobante, luego anotar los datos del cliente y finalmente guardarlo.",
    },
    {
      title:
        "Procesos internos. Criterios - Proceso administrativo-comercial - Comercial - Gestión de reclamos",
      body: "El flujo de la tarea de gestión de reclamos comienza con el ingreso de un reclamo que puede ser por llamado, whatsapp o en oficina. Luego de ingresado el reclamo, el área administrativa carga la tarea a bitrix con una plantilla de bitrix, luego se hace el cambio de nombre de tarea y posteriormente se completan datos de descripción, se debe subir fotos, asignar responsable y asignar plazo de ejecución. Además de asignar el plazo hay que determinar si es de alta prioridad o no. Cuando la oficina técnica recibe la tarea, un responsable recibe una notificación y marca que la recibió. El responsable puede agregar comentarios en caso de ser necesario. A continuación, el responsable debe pasar la tarea a 'en progreso', luego completar la tarea y finalmente marcar el boton 'terminar' pasando a 'terminadas' la tarea.",
    },
    {
      title:
        "Procesos internos. Criterios - Proceso administrativo-comercial - Comercial - Procesos especiales",

      body: `Hemos denominado como “procesos especiales” a dos de los subprocesos que hacen a la base de nuestro ADN comercial, y que nos destacan en el mercado como una empresa que busca satisfacer la necesidad de vivienda asegurando el acceso real a las mismas. En este apartado explicaremos de manera esquemática el sistema del plan HÁBITAT 99, abordando los subprocesos de sorteos y puntajes, con sus respectivos fondos y funcionamiento. Cabe aclarar que este proceso ha sido construido en su totalidad por miembros del equipo responsable de realizarlo.
      El flujo comienza cuando el cliente solicita ingresar al plan, ante esto una entidad acepta la solicitud, luego el cliente paga la inscripción y pasa a ser suscriptor provisorio. A partir de aquí hay dos opciones, si no hay grupo formado se espera su conformación para ingresar al mismo, la otra opción es que haya un grupo formado entonces se incorpora al grupo correspondiente de acuerdo a su número de orden. Luego los caminos convergen ya que en ambos casos se pasa a ser un suscriptor definitivo punto a partir del cual se empiezan a pagar cuotas.
      A la hora de pagar cuotas hay dos caminos que se dividen, el primero es pagar cuotas adelantadas (optativas), en donde la suma de todas las cuotas adelantadas del grupo se acumulan en el fondo de puntaje (FP) de ese grupo lo cual lleva finalmente a una preadjudicación por puntaje. El otro camino es pagar cuotas mensuales (obligatorias), en donde la suma de todas las cuotas mensuales del grupo se acumulan en el fondo de sorteo (FS) de ese grupo. Ahora la preadjudicación se puede dar por dos caminos, uno es preadjudicar por desborde lo cual resta 428 al FS, el otro camino es la preadjudicación por sorteo que resta 368 cuotas al FS. 
      En caso de avanzar con este último tipo de preadjudicación (sorteo) se realiza un último sorteo del mes por lotería de Mendoza, el número de sorteo puede estar fuera del grupo o dentro del grupo. Si cae fuera no pasa nada pero si cae dentro del grupo hay dos opciones, una es que el suscriptor esté en mora o ya preadjudicado, en este caso se pasa la preadjudicación el primero en puntaje o número de orden menor y la otra opción es que el suscriptor no esté preadjudicado al día, ante esto el suscriptor puede aceptar la preadjudicación con lo cual da lugar a la preadjudicación correspondiente al número sorteado, el suscriptor también puede rechazar la preadjudicación con lo cual la misma pasa al primero en puntaje o número de orden menor.
      Hasta aquí hemos mencionado tres de las formas de preadjudicar, las dos que surgen de si el suscriptor acepta o rechaza la preadjudicación que serían “Preadjudicación correspondiente al número sorteado” y “Preadjudicación al primero en puntaje o número de orden menor” correspondientemente y la última forma era la que surgía si el suscriptor sorteado ya estaba en mora o preadjudicado que daba lugar a una “preadjudicación al primero en puntaje o número de orden menor” que es distinta a la mencionada anteriormente.
      Quedan por mencionar dos formas más que no tienen que ver con sorteo sino que aparecen una por preadjudicación por desborde y otra por preadjudicación por puntaje, en ambos casos la preadjudicación se hace “al primero en puntaje o número de orden menor” pero son distintas entre sí pues provienen de distintos caminos.
      Las cinco formas de preadjudicar convergen en “Tener un preadjudicado”, a continuación el mismo debe pagar el derecho de adjudicación ante lo cual se transforma en adjudicatario. A continuación debe elegir el lote (de la empresa o propio), también debe elegir el modelo de vivienda y también comienzan a correr los plazos de entrega. Luego, meses antes de la entrega debe completar la documentación de: ingresos, garantes y seguro de vida. Finalmente se hace la entrega de vivienda. Una vez entregada la vivienda comienza a correr el plazo de garantía y desde el mes siguiente paga cuota doble, posteriormente sigue pagando cuotas hasta cancelar. Una vez cancelada, se escritura.`,
    },
    {
      title: "Herramientas de utilidad - Bitrix como herramienta principal",
      body: "Link al manual de la herramienta: https://drive.google.com/file/d/1jPdYFdaUTEYl_iZZncfRrYXOKAqOp_l4/view",
    },
    {
      title: "Formularios automatizados",
      body: "Link al hub de inicio, donde se encuentran todos los formularios centralizados: https://docassemble.somoscorpora.com/run/colonialautomatizaciones/hubDocumentos/#/1",
    },
    {
      title: "Conclusión",
      body: "Ya conocés todo sobre Constructora Colonial. Sobre nosotros, quiénes somos y qué hacemos. Y algo muy importante, cómo lo hacemos y para quién. No te olvides de que vos sos parte fundamental de esta estructura, por eso te pedimos que uses esta guía con responsabilidad como una herramienta más de tu trabajo.",
    },
  ];

  const processedParagraphs = paragraphs.map((paragraph) => {
    return "Título: " + paragraph.title + "\n Contenido: " + paragraph.body;
  });

  return processedParagraphs;
}

async function upsertToPinecone(data) {
  const batchSize = 32; // process everything in batches of 32
  const numEntries = data.length;

  await pinecone.init({
    environment: "us-west4-gcp",
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pinecone.Index("manualcolonial");

  try {
    for (let i = 0; i < numEntries || i % batchSize !== 0; i += batchSize) {
      // i = 0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320
      const iEnd = Math.min(i + batchSize, numEntries);

      // consigo las 32 próximas líneas (o menos si es el final del array)
      const linesBatch = data.slice(i, iEnd);
      const idsBatch = Array.from({ length: batchSize }, () => uuidv4());

      // convierto párrafos a embeddings
      const input = { input: linesBatch, model: MODEL };
      const res = await openai.createEmbedding(input);
      const embeds = res.data.data.map((record) => record.embedding);

      // creo un objeto con los ids, los embeddings y los metadatos
      const meta = linesBatch.map((line) => ({ text: line }));
      let toUpsert = idsBatch.map((id, j) => {
        return {
          id,
          values: embeds[j],
          metadata: meta[j],
        };
      });

      await index.upsert({ upsertRequest: { vectors: toUpsert } });
    }
    return {
      error: false,
      errorMessage: null,
    };
  } catch (err) {
    return {
      error: true,
      errorMessage: err.message,
    };
  }
}

async function upsertToSupabase(data) {
  data.forEach(async ({ title, body }) => {
    const embeddingResponse = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: body,
    });
    const embedding = embeddingResponse.data.data[0].embedding;
    const { data, error } = await supabase.from("posts").insert({
      title,
      body,
      embedding,
    });
    if (error) console.log("Error upserting paragraph:", error);
  });
}
