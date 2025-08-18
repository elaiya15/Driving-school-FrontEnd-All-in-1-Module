import { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom'; 
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import './form.css';
import moment from 'moment';
const backEndUrl=import.meta.env.VITE_BACK_URL; 
import {extractDriveFileId,} from '../ImageProxyRouterFunction/funtion.js'




const Form14Register = () => {
  const location = useLocation();
  const learner = location.state;
  const formRef = useRef();

 


  const [formData, setFormData] = useState({

    photo: learner?.photo ? learner.photo : null,
    enrolmentNumber: learner?.admissionNumber || '',
    traineeName: learner?.fullName || '',
    guardianName: learner?.fathersName || '',
    permanentAddress: learner?.address || '',
    tempAddress: learner?.address || '',
    dob: learner?.dateOfBirth  ? moment(learner.joinDate).format('DD-MM-YYYY') : '',
    vehicleClass: learner?.vehicleClass || '',
    enrolmentDate: learner?.joinDate ? moment(learner.joinDate).format('DD-MM-YYYY') : '',
    licenceNumber: learner?.licenseNumber || '',
    courseCompletionDate: learner?.courseCompletionDate || '',
    testPassingDate: learner?.testPassingDate || '',
    dlDetails: learner?.dlDetails || '',
    remarks: learner?.remarks || '',
    // signature: learner?.signature || '',
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };


  const tempAddressRef = useRef(null);
  const permanentAddressRef = useRef(null);
 
  const TexthandleChange = (e, field) => {
    const textarea = e.target;
    const value = e.target.value.replace(/\n/g, ' '); // Remove newline characters
    
    // Measure height and prevent overflow after 3 rows
    textarea.value = value;
    
    // Check if the textarea height exceeds 3 rows (72px is about 3 rows)
    if (textarea.scrollHeight <= 72) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleKeyDown = (e, field) => {
    const textarea = e.target;
    const currentLines = textarea.value.split('\n').length;

    // Prevent the 4th line
    if (e.key === 'Enter' && currentLines >= 3) {
      e.preventDefault();
    }
  };


// const handleDownloadPDF = async () => {
//   const canvas = await html2canvas(formRef.current);
//   const imgData = canvas.toDataURL('image/png');
//   const pdf = new jsPDF();
//   pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
//   pdf.save('Form14Register.pdf');
// };



  return (
    <div className="min-h-screen p-0 bg-gray-100">
      <div
        ref={formRef}
        className="p-8 mx-auto text-sm bg-white border border-gray-500"
        style={{
          width: '210mm',
          height: '297mm',
          fontFamily: 'Arial, sans-serif',
          lineHeight: '1.8',
        }}
      >
        <div className="relative flex flex-col space-y-5">
          <div className="text-lg font-bold text-center">FORM - 14</div>
          <div className="mb-4 text-xs text-center">
            [See Rule 27 (a) & (c)]<br />
            Register Showing the enrolment of trainee(s) in the driving school, establishments
          </div>

          <div>
            <strong>REGISTER FOR THE YEAR</strong> - <span className="ml-4">2024</span>
            <div className="absolute top-[2.5cm] right-4 w-[90px] h-[110px] border border-gray-500">
              <img
                 src={`${backEndUrl}/api/image-proxy/${extractDriveFileId(formData.photo)}`}
                alt='No image'
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">1. Enrolment Number</strong>
            <div className="flex items-center justify-center w-auto">
            :  <input
                type="text"
                name="enrolmentNumber"
                value={formData.enrolmentNumber}
                onChange={handleChange}
                className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted"

                // className="w-full ml-2 border-0 border-b-2 border-black border-dotted"

              />
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2 ">2. Name of the Trainee with his Photograph</strong>
            <div className="flex items-center justify-center w-1/2">
            :   <input
                type="text"
                name="traineeName"
                value={formData.traineeName}
                onChange={handleChange}
                className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted"

              />
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">3. Son / Wife / Daughter of</strong>
            <div className="flex items-center justify-center w-1/2">
             : <input
                type="text"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted"


              />
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">4. (a) Permanent Address</strong>
            <div className="flex items-center justify-center w-1/2">
            :   <textarea
        ref={tempAddressRef}
        name="tempAddress"
        value={formData.tempAddress}
        onChange={(e) => TexthandleChange(e, 'tempAddress')}
        onKeyDown={(e) => handleKeyDown(e, 'tempAddress')}
        className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted resize-none overflow-hidden"
        rows={3} // Restrict the textarea to 3 rows height
        style={{ height: '72px', lineHeight: '24px' }} // Ensures a max of 3 lines height
      />

            {/* : <textarea
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
                // className="w-full border-b border-gray-400"  bg-zinc-200


                className="w-full  ml-2 border-0 border-b-[1.3px] border-black border-dotted resize-none h-[72px] overflow-hidden"
                rows={3}
              /> */}
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">(b) Temporary Address / Official Address (if any)</strong>
            <div className="flex items-center justify-center w-1/2">
           
   
        :  <textarea
        ref={permanentAddressRef}
        name="permanentAddress"
        value={formData.permanentAddress}
        onChange={(e) => TexthandleChange(e, 'permanentAddress')}
        onKeyDown={(e) => handleKeyDown(e, 'permanentAddress')}
        className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted resize-none h-[72px] overflow-hidden"
        rows={3} // Restrict the textarea to 3 rows height
        style={{ height: '72px', lineHeight: '24px' }} // Ensures a max of 3 lines height
      />
             
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">5. Date of Birth</strong>
            <div className="flex items-center justify-center w-1/2">
            :   <input
                type="text"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
             className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted"
              />
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">6. Class of Vehicle for which Training Imparted</strong>
            <div className="flex items-center justify-center w-1/2">
            :  <input
                type="text"
                name="vehicleClass"
                value={formData.vehicleClass}
                onChange={handleChange}
                className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted"

              />
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">7. Date of Enrolment</strong>
            <div className="flex items-center justify-center w-1/2">
             : <input
                type="text"
                name="enrolmentDate"
                value={formData.enrolmentDate}
                onChange={handleChange}
                className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted"


              />
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">8. Learner’s Licence number & Date of its expiry</strong>
            <div className="flex items-center justify-center w-1/2">
             : <input
                type="text"
                name="licenceNumber"
                value={formData.licenceNumber}
                onChange={handleChange}
                className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted"


              />
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">9. Date of Completion of the Course</strong>
            <div className="flex items-center justify-center w-1/2">
            :  <input
                type="text"
                name="courseCompletionDate"
                value={formData.courseCompletionDate}
                onChange={handleChange}
                className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted"


              />
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">10. Date of Passing Test of Competence to drive</strong>
            <div className="flex items-center justify-center w-1/2">
            :   <input
                type="text"
                name="testPassingDate"
                value={formData.testPassingDate}
                onChange={handleChange}
                className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted"


              />
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">11. DL Number, Issue Date & Authority</strong>
            <div className="flex items-center justify-center w-1/2 ">
            :   <input
                type="text"
                name="dlDetails"
                value={formData.dlDetails}
                onChange={handleChange}
                className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted"

              />
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">12. Remarks</strong>
            <div className="flex items-center justify-center w-1/2 ">
            :   <input
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted"


              />
            </div>
          </div>

          <div className="flex mt-2">
            <strong className="w-1/2">13. Signature of the Licence Holder / Instructor</strong>
            <div className="flex items-center justify-center w-1/2 ">
            :   <input
                type="text"
                name="signature"
                value={formData.signature}
                onChange={handleChange}
                className="w-full ml-2 border-0 border-b-[1.3px] border-black border-dotted"

              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-6 print:hidden">
        {/* <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Download PDF
        </button> */}
        <button
          onClick={handlePrint}
          className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default Form14Register;
