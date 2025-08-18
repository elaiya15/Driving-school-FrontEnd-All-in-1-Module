
//  DrivingForm5.jsx
import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import styles from './DrivingForm5.module.css';


const Form5Certificate = () => {
  const [formData, setFormData] = useState({
    name: "Ligin G",
    fatherName: "Ganesh",
    address: "Ligin Nivas, Karadipara, Vannamada, Kozhipatty, Chittur, Palakkad, KL - 678 555",
    enrollmentDate: "05.07.2024",
    serialNumber: "863",
    course: "LMV",
    syllabusFrom: "05.07.2024",
    syllabusTo: "",
  });

  const formRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const printForm = () => {
    window.print();
  };
  

  return (
    <div className=" mt-0 p-0 ">
      <div
        ref={formRef}
        className={styles.container}
        // className={`w-[210mm] min-h-[297mm] mx-auto p-10 text-black bg-white text-[15px] leading-snug border border-gray-300 ${styles.printOnly}`}

      >
        <h2 className="text-center font-bold text-[16px]">FORM - 5</h2>
        <p className="text-center">(See Rule 14(e), 17(1)(b) and 27(d))</p>
        <h3 className="text-center font-bold text-[15px] mt-2 leading-5">
          DRIVING CERTIFICATE ISSUED BY DRIVING SCHOOL <br />
          OR ESTABLISHMENTS
        </h3>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <span>This is to certify that Shri. / Smt. Kum. </span>
            <input name="name" value={formData.name} onChange={handleChange}
              className="w-60 text-center ml-2 border-0 outline-none border-b-[1.3px] border-black border-dotted" />
          </div>

          <div>
            <span className="p-1">Son / Wife / Daughter of </span>
            <input name="fatherName" value={formData.fatherName} onChange={handleChange}
              className="pl-1 text-center border-black border-b-[1.3px] border-dotted outline-none w-[450px] inline-block" />
          </div>

          <div className="leading-snug">
            <span className="p-1">Residing at </span>
            <input name="address" value={formData.address} onChange={handleChange}
              className="text-center border-black border-b-[1.3px] border-dotted outline-none w-[80%] inline-block my-2" />
            <br />
            <span className="p-1">was enrolled in this School on </span>
            <input name="enrollmentDate" value={formData.enrollmentDate} onChange={handleChange}
              className="text-center border-b-[1.3px] border-dotted border-black outline-none w-72 inline-block my-2" />
            <span>and his / her name is registered as serial number </span>
            <input name="serialNumber" value={formData.serialNumber} onChange={handleChange}
              className="my-2 text-center border-b-[1.3px] border-dotted border-black outline-none w-72 inline-block" />
            <span>in our register in Form 14 and that he / she has undergone the course of training in driving of </span>
            <input name="course" value={formData.course} onChange={handleChange}
              className="my-2 border-b-[1.3px] border-dotted text-center border-black outline-none w-80 inline-block" />
            <br />
            <div className="text-center relative left-36">(mention class of vehicle)</div>

            <span className="">according to the syllabus prescribed for a period from </span>
            <input name="syllabusFrom" value={formData.syllabusFrom} onChange={handleChange}
              className="my-4 text-center border-b-[1.3px] border-dotted border-black outline-none w-36 inline-block" />
            <span>to </span>
            <input name="syllabusTo" value={formData.syllabusTo} onChange={handleChange}
              className="my-4 text-center border-b-[1.3px] border-dotted border-black outline-none w-36 inline-block" />
            <span> satisfactorily.</span>
          </div>

          <div className="mt-6 text-center">
            <span>I am satisfied with his / her physical fitness and sense of responsibility.</span>
          </div>
        </div>

        <div className="flex justify-end mt-10">
          <div>
            <p>Signature
              <input name="Signature" disabled className=" my-2 text-center border-b-[1.3px] border-dotted border-black outline-none w-36 inline-block" />
            </p>
            <p className="my-2">Name and Designation
              <input name="Designation" disabled className="my-2 text-center border-b-[1.3px] border-dotted border-black outline-none w-36 inline-block" />
            </p>
          </div>
        </div>

        <div className="mt-16">
          <p className="text-[13px]">
            Name and address of the Driving School with Licence Number and date of issue
          </p>
        </div>
      </div>

      
        {/* <div className={`mb-4 no-print flex gap-4 justify-center items-center ${styles.noPrint}`}> */}
        <div className={`mb-4 no-print ${styles.noPrint} flex gap-4 justify-center items-center `}>
            <button onClick={printForm} className="my-2 bg-blue-600 text-white px-4 py-2 rounded">
    
        Print</button>
    </div>
    </div>

   
  );
};

export default Form5Certificate;
