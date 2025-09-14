import React from 'react';

const App = () => {
  const [invoices, setInvoices] = React.useState([]);
  const [currentInvoice, setCurrentInvoice] = React.useState({
    invoiceNumber: 1,
    clientName: '',
    description: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    isCancelled: false,
  });
  const [isEditing, setIsEditing] = React.useState(false);

  // Your business details (static)
  const myDetails = {
    name: "היי קלאס",
    address: "המגינים 14 כניסה 2",
    phone: "050-6784018",
    email: "mkless@gmail.com",
    vatId: "029538576"
  };

  // Load invoices from localStorage on initial render
  React.useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem('invoices');
      if (storedInvoices) {
        const parsedInvoices = JSON.parse(storedInvoices);
        setInvoices(parsedInvoices);
        
        // Find the highest invoice number for the next one
        const maxNumber = parsedInvoices.length > 0
          ? Math.max(...parsedInvoices.map(inv => inv.invoiceNumber))
          : 0;
        setCurrentInvoice(prev => ({ ...prev, invoiceNumber: maxNumber + 1 }));
      }
    } catch (e) {
      console.error("Failed to load invoices from local storage:", e);
    }
  }, []);

  // Handle changes in the main form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentInvoice(prev => ({
      ...prev,
      [name]: name === 'invoiceNumber' ? parseInt(value) || 0 : value
    }));
  };

  // Handle changes in item rows
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...currentInvoice.items];
    const parsedValue = name === 'description' ? value : parseFloat(value) || 0;
    newItems[index][name] = parsedValue;
    
    // Recalculate item total
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;

    setCurrentInvoice(prev => ({ ...prev, items: newItems }));
  };

  // Add a new empty item row
  const addItem = () => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  // Remove an item row
  const removeItem = (index) => {
    const newItems = [...currentInvoice.items];
    newItems.splice(index, 1);
    setCurrentInvoice(prev => ({ ...prev, items: newItems }));
  };
  
  // Calculate the grand total of all items
  const calculateGrandTotal = () => {
    return currentInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // Save the invoice to local storage
  const saveInvoice = () => {
    let updatedInvoices;
    if (isEditing) {
      updatedInvoices = invoices.map(inv => 
        inv.id === currentInvoice.id ? { ...currentInvoice, grandTotal: calculateGrandTotal() } : inv
      );
      setIsEditing(false);
    } else {
      const newInvoice = {
        id: crypto.randomUUID(), // Generate a unique ID for the invoice
        ...currentInvoice,
        createdAt: new Date().toISOString(),
        grandTotal: calculateGrandTotal()
      };
      updatedInvoices = [...invoices, newInvoice];
    }
    
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    resetForm();
  };

  // Set the form to edit an existing invoice
  const editInvoice = (invoice) => {
    setCurrentInvoice({ ...invoice });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle cancellation status of an invoice
  const toggleCancelInvoice = (invoiceId) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, isCancelled: !inv.isCancelled } : inv
    );
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
  };

  // Delete an invoice from local storage
  const deleteInvoice = (invoiceId) => {
    const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    resetForm();
  };

  // Reset the form to create a new invoice
  const resetForm = () => {
    const maxNumber = invoices.length > 0 ? Math.max(...invoices.map(inv => inv.invoiceNumber)) : 0;
    setCurrentInvoice({
      invoiceNumber: maxNumber + 1,
      clientName: '',
      description: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      isCancelled: false,
    });
    setIsEditing(false);
  };

  // Use the browser's print function to save as PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 font-sans" dir="rtl">
      <style>{`
        @media print {
          body > :not(#invoice-to-print) {
            display: none !important;
          }
          #invoice-to-print {
            display: block !important;
            margin: 0;
            padding: 20px;
            direction: rtl;
            font-family: Arial, sans-serif;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="container mx-auto max-w-4xl bg-white rounded-xl shadow-lg p-6 sm:p-10 mb-8 no-print">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-800 mb-6">יצירת חשבונית</h1>
        <div className="border-b-2 border-gray-200 pb-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <div className="text-lg font-bold text-gray-700">
              {isEditing ? (
                <div className="flex items-center">
                  <span>חשבונית מס'</span>
                  <input
                    type="number"
                    name="invoiceNumber"
                    value={currentInvoice.invoiceNumber}
                    onChange={handleInputChange}
                    className="w-24 text-center mr-2 p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <span>חשבונית מס' {currentInvoice.invoiceNumber}</span>
              )}
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>תאריך: {new Date().toLocaleDateString('he-IL')}</p>
            </div>
          </div>
          <div className="text-right leading-relaxed mb-4">
            <p className="font-semibold text-xl text-blue-900">{myDetails.name}</p>
            <p>{myDetails.address}</p>
            <p>טלפון: {myDetails.phone}</p>
            <p>אימייל: {myDetails.email}</p>
            <p>מספר עוסק מורשה: {myDetails.vatId}</p>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="clientName" className="block text-gray-700 font-semibold mb-2">שם הלקוח</label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={currentInvoice.clientName}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">תיאור השירות הכללי שניתן</label>
          <textarea
            id="description"
            name="description"
            value={currentInvoice.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          ></textarea>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">פירוט פריטים</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-right border-collapse rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-sm sm:text-base">
                <th className="p-3">תיאור</th>
                <th className="p-3">כמות</th>
                <th className="p-3">מחיר יחידה</th>
                <th className="p-3">סה"כ</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {currentInvoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-300 hover:bg-gray-50 transition-colors duration-200">
                  <td className="p-3">
                    <input
                      type="text"
                      name="description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      name="unitPrice"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3 font-semibold">
                    ₪{ (item.quantity * item.unitPrice).toFixed(2) }
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-4">
            <button
              onClick={addItem}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              הוסף פריט
            </button>
          </div>
        </div>

        <div className="flex justify-end items-center text-2xl font-bold text-gray-800 mt-8 mb-6">
          <span className="ml-4">סה"כ לתשלום:</span>
          <span>₪{calculateGrandTotal().toFixed(2)}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={saveInvoice}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md transform hover:scale-105"
          >
            {isEditing ? 'עדכן חשבונית' : 'שמור חשבונית'}
          </button>
          <button
            onClick={resetForm}
            className="bg-gray-400 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors duration-300 shadow-md transform hover:scale-105"
          >
            נקה טופס
          </button>
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-md transform hover:scale-105"
          >
            הדפס / שמור כ-PDF
          </button>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl bg-white rounded-xl shadow-lg p-6 sm:p-10">
        <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">היסטוריית חשבוניות</h2>
        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <p className="text-center text-gray-500">עדיין אין חשבוניות.</p>
          ) : (
            <table className="w-full text-right border-collapse rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-sm sm:text-base">
                  <th className="p-3">מס' חשבונית</th>
                  <th className="p-3">שם הלקוח</th>
                  <th className="p-3">תאריך</th>
                  <th className="p-3">סה"כ</th>
                  <th className="p-3">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {invoices.sort((a, b) => b.invoiceNumber - a.invoiceNumber).map((invoice) => (
                  <tr
                    key={invoice.id}
                    className={`border-b border-gray-300 transition-colors duration-200 ${invoice.isCancelled ? 'bg-red-50 opacity-70' : 'hover:bg-gray-50'}`}
                  >
                    <td className={`p-3 ${invoice.isCancelled ? 'line-through text-gray-500' : ''}`}>{invoice.invoiceNumber}</td>
                    <td className={`p-3 ${invoice.isCancelled ? 'line-through text-gray-500' : ''}`}>{invoice.clientName}</td>
                    <td className={`p-3 ${invoice.isCancelled ? 'line-through text-gray-500' : ''}`}>{new Date(invoice.createdAt).toLocaleDateString('he-IL')}</td>
                    <td className={`p-3 font-semibold ${invoice.isCancelled ? 'line-through text-gray-500' : ''}`}>₪{invoice.grandTotal.toFixed(2)}</td>
                    <td className="p-3 flex gap-2 justify-center">
                      <button
                        onClick={() => editInvoice(invoice)}
                        className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                        title="ערוך"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => toggleCancelInvoice(invoice.id)}
                        className={`transition-colors duration-200 ${invoice.isCancelled ? 'text-green-500 hover:text-green-700' : 'text-orange-500 hover:text-orange-700'}`}
                        title={invoice.isCancelled ? 'בטל סימון' : 'סמן כמבוטל'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        title="מחק"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
