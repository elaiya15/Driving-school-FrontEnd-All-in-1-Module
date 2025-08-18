import React, { useRef, useState } from 'react'; 
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './Form15.module.css';

const Form15 = () => {
  const componentRef = useRef();
  
  const [form, setForm] = useState({
    schoolName: 'GDS',
    traineeName: 'Prinoy',
    enrolmentNumber: 'L038',
    dateOfEnrolment: '17/06/22',
    entries: Array(20).fill({ date: '', from: '', to: '', class: '' })
  });

  const handleChange = (index, field, value) => {
    const updated = [...form.entries];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, entries: updated });
  };

 

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=600');
    printWindow.document.write('<html><head><title>Print Form15</title>');
    
    // Add styles manually (inline or link to your stylesheet)
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        if (sheet.href) {
          // External stylesheet
          return `<link rel="stylesheet" type="text/css" href="${sheet.href}" />`;
        } else {
          // Inline styles
          return Array.from(sheet.cssRules).map(rule => `<style>${rule.cssText}</style>`).join('');
        }
      })
      .join('');

    printWindow.document.write(styles); // Add the styles to the print window
    
  // Add padding to the body of the print window
  printWindow.document.write(`
    <style>
      body {
        padding: 40px;
      }
    </style>
  `);


    printWindow.document.write('</head><body>');
    printWindow.document.write(componentRef.current.innerHTML);  // Print only the content inside the componentRef
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();  // Necessary for IE
    printWindow.print();
  };

  return (
    <div  className="p-0">
    

      <div  ref={componentRef} 
      // className={styles.container} 
      className="max-w-4xl p-10 mx-auto text-black bg-white border border-gray-500"
      >
        <h2 className="mb-1 text-xl font-bold text-center underline">FORM 15</h2>
        <p className="mb-1 text-sm text-center">(See Rule 27 (1))</p>
        <h3 className="mb-4 font-medium text-center text-md">Register showing the Driving hours spent by a Trainee</h3>

        <div className="grid grid-cols-2 mb-4 text-sm">
          <div className="mb-1">
            <strong>Name of the School:</strong> 
            <input
              type="text"
              value={form.schoolName}
              onChange={e => setForm({ ...form, schoolName: e.target.value })}
              className="border-0 border-b-[1.5px] border-black border-dotted  min-w-[120px] ml-1"
            />
          </div>
          <div className="mb-1">
            <strong>Name of the Trainee:</strong>
            <input
              type="text"
              value={form.traineeName}
              onChange={e => setForm({ ...form, traineeName: e.target.value })}
              className="border-0 border-b-[1.5px] border-black border-dotted  outline-none min-w-[120px] ml-1"
            />
          </div>
          <div>
            <strong>Enrolment Number:</strong>
            <input
              type="text"
              value={form.enrolmentNumber}
              onChange={e => setForm({ ...form, enrolmentNumber: e.target.value })}
              className="border-0 border-b-[1.5px] border-black border-dotted outline-none min-w-[80px] ml-1"
            />
          </div>
          <div>
            <strong>Date of Enrolment:</strong>
            <input
              type="text"
              value={form.dateOfEnrolment}
              onChange={e => setForm({ ...form, dateOfEnrolment: e.target.value })}
              className=" border-0 border-b-[1.5px] border-black border-dotted outline-none min-w-[80px] ml-1"
            />
          </div>
        </div>
        <br />
        <table className="w-full text-xs border border-collapse border-black">
          <thead className="text-center bg-gray-200">
            <tr>
              <th className="border border-black" rowSpan={2}>#</th>
              <th className="border border-black" rowSpan={2}>Date</th>
              <th className="border border-black" colSpan={2}>Hours spent in actual driving</th>
              <th className="border border-black" rowSpan={2}>Class of Vehicle</th>
              <th className="border border-black" rowSpan={2}>Signature of the Instructor</th>
              <th className="border border-black" rowSpan={2}>Signature of the Trainee</th>
            </tr>
            <tr>
              <th className="border border-black">From...Hrs.</th>
              <th className="border border-black">To...Hrs.</th>
            </tr>
          </thead>
          <tbody>
            {form.entries.map((entry, index) => (
              <tr key={index}>
                <td className="py-1 text-center border border-black">{index + 1}</td>
                <td className="px-1 py-1 border border-black">
                  <input
                    type="text"
                    value={entry.date}
                    onChange={e => handleChange(index, 'date', e.target.value)}
                    className="w-full border-b border-gray-400 border-none outline-none"
                  />
                </td>
                <td className="px-1 py-1 border border-black">
                  <input
                    type="text"
                    value={entry.from}
                    onChange={e => handleChange(index, 'from', e.target.value)}
                    className="w-full border-b border-gray-400 border-none outline-none"
                  />
                </td>
                <td className="px-1 py-1 border border-black">
                  <input
                    type="text"
                    value={entry.to}
                    onChange={e => handleChange(index, 'to', e.target.value)}
                    className="w-full border-b border-gray-400 border-none outline-none"
                  />
                </td>
                <td className="px-1 py-1 border border-black">
                  <input
                    type="text"
                    value={entry.class}
                    onChange={e => handleChange(index, 'class', e.target.value)}
                    className="w-full border-b border-gray-400 border-none outline-none"
                  />
                </td>
                <td className="w-40 px-1 py-6 border border-black"></td>
                <td className="w-40 px-1 py-6 border border-black"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <br/>
      <div className="flex justify-center items-center gap-4 mb-4">
        <button onClick={handlePrint} className="px-4 py-2 text-white bg-blue-600 rounded">
          Print
        </button>
      </div>
    </div>
  );
};

export default Form15;
