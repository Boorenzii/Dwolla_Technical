import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Typography, 
  Box,
  Container,
  Grid
} from '@mui/material';
import type { NextPage } from 'next';

// Define the Customer interface
interface Customer {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

/**
 * Home Page Component
 * 
 * This component displays a table of customers and provides a form dialog
 * to add new customers to the system.
 */
const Home: NextPage = () => {
  // ---------- State Management ----------
  
  // Customers list and loading state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Dialog visibility state
  const [open, setOpen] = useState<boolean>(false);
  
  // New customer form data state
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phoneNumber: ''
  });
  
  // Form validation errors state
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });

  // ---------- Data Fetching ----------
  
  /**
   * Fetch customers from the API when the component mounts
   * Uses the /api/customers endpoint (GET)
   */
  useEffect(() => {
    const getCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        // Set loading to false regardless of success or failure
        setLoading(false);
      }
    };

    getCustomers();
  }, []); // Empty dependency array ensures this runs only once on mount

  // ---------- Event Handlers ----------
  
  /**
   * Opens the add customer dialog
   */
  const handleClickOpen = () => {
    setOpen(true);
  };

  /**
   * Closes the add customer dialog and resets form state
   */
  const handleClose = () => {
    setOpen(false);
    // Reset form fields and errors when dialog is closed
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      phoneNumber: ''
    });
    setErrors({
      firstName: false,
      lastName: false,
      email: false,
    });
  };

  /**
   * Handles changes to form input fields
   * Updates the newCustomer state and clears validation errors for the field
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Update the new customer form data
    setNewCustomer({
      ...newCustomer,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
  };

  /**
   * Validates the form fields
   * Checks that required fields are filled and email is valid
   * @returns boolean - true if form is valid, false otherwise
   */
  const validateForm = () => {
    // Create new errors object based on validation rules
    const newErrors = {
      firstName: !newCustomer.firstName, // Required field
      lastName: !newCustomer.lastName, // Required field
      email: !newCustomer.email || !/\S+@\S+\.\S+/.test(newCustomer.email), // Required and must be valid email format
    };
    
    // Update errors state
    setErrors(newErrors);
    
    // Form is valid if no errors (none of the values in newErrors are true)
    return !Object.values(newErrors).some(Boolean);
  };

  /**
   * Handles form submission to add a new customer
   * Validates form, makes API call, and updates UI on success
   */
  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      // Make POST request to API
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });
      
      if (response.ok) {
        // API doesn't return the created customer, so we create one locally
        // with a temporary ID for display purposes
        const newCustomerData = {
          id: Date.now().toString(), // Generate a temporary ID
          ...newCustomer
        };
        
        // Add new customer to the list
        setCustomers([...customers, newCustomerData]);
        
        // Close the dialog and reset form
        handleClose();
      } else {
        console.error('Failed to add customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  // ---------- Component Rendering ----------
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with title and Add Customer button */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Customers
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleClickOpen}
          sx={{
            backgroundColor: '#1F2937', // Dark background for button matching design
            color: 'white',
            '&:hover': {
              backgroundColor: '#374151',
            }
          }}
        >
          ADD CUSTOMER
        </Button>
      </Box>

      {/* Conditional rendering based on loading state */}
      {loading ? (
        <Typography>Loading customers...</Typography>
      ) : (
        // Customer table
        <TableContainer component={Paper} sx={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <Table sx={{ minWidth: 650 }} aria-label="customers table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>First Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Last Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, borderBottom: '1px solid #E5E7EB' }}
                >
                  <TableCell component="th" scope="row" sx={{ py: 2 }}>
                    {customer.firstName}
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>{customer.lastName}</TableCell>
                  <TableCell sx={{ py: 2 }}>{customer.email}</TableCell>
                  <TableCell sx={{ py: 2 }}>{customer.phoneNumber || ''}</TableCell>
                  <TableCell sx={{ py: 2 }}>{customer.address || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Customer Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Customer</DialogTitle>
        <DialogContent>
          {/* Form Grid Layout */}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* First Name Field - Required */}
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                margin="dense"
                id="firstName"
                name="firstName"
                label="First Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newCustomer.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                helperText={errors.firstName ? 'First name is required' : ''}
                required
              />
            </Grid>
            {/* Last Name Field - Required */}
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="lastName"
                name="lastName"
                label="Last Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newCustomer.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                helperText={errors.lastName ? 'Last name is required' : ''}
                required
              />
            </Grid>
            {/* Email Field - Required */}
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="email"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={newCustomer.email}
                onChange={handleInputChange}
                error={errors.email}
                helperText={errors.email ? 'Valid email is required' : ''}
                required
              />
            </Grid>
            {/* Phone Number Field - Optional */}
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="phoneNumber"
                name="phoneNumber"
                label="Phone Number"
                type="tel"
                fullWidth
                variant="outlined"
                value={newCustomer.phoneNumber}
                onChange={handleInputChange}
              />
            </Grid>
            {/* Address Field - Optional */}
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="address"
                name="address"
                label="Address"
                type="text"
                fullWidth
                variant="outlined"
                value={newCustomer.address}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        {/* Dialog Actions */}
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleClose} sx={{ color: '#6B7280' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              backgroundColor: '#1F2937',
              '&:hover': {
                backgroundColor: '#374151',
              }
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home;