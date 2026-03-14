
function generarPDF(){

 if(!window.cotizacion){
   alert("Primero calcula el flete")
   return
 }

 const { jsPDF } = window.jspdf

 let c=window.cotizacion

 let doc=new jsPDF()

 doc.setFontSize(18)
 doc.text("Cotización Transporte",20,20)

 doc.setFontSize(12)
 doc.text("Km: "+c.km,20,40)
 doc.text("Diesel: $"+Math.round(c.dieselCosto),20,50)
 doc.text("Casetas: $"+c.casetas,20,60)
 doc.text("Precio Alto: $"+c.alto,20,80)

 doc.save("cotizacion.pdf")

}
