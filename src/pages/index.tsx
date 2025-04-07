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

const Home: NextPage = () => {
  // State for customer list and loading state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State for the add customer dialog
  const [open, setOpen] = useState<boolean>(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phoneNumber: ''
  });
  
  // State for form validation
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });

  // Fetch customers on component mount
  useEffect(() => {
    const getCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    getCustomers();
  }, []);

  // Handle dialog open/close
  const handleClickOpen = () => {
    setOpen(true);
  };

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

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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

  // Validate form fields
  const validateForm = () => {
    const newErrors = {
      firstName: !newCustomer.firstName,
      lastName: !newCustomer.lastName,
      email: !newCustomer.email || !/\S+@\S+\.\S+/.test(newCustomer.email),
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });
      
      if (response.ok) {
        // Create a new customer object with an ID and the form data
        const newCustomerData = {
          id: Date.now().toString(), // Generate a temporary ID
          ...newCustomer
        };
        
        // Add to the customers list
        setCustomers([...customers, newCustomerData]);
        handleClose();
      } else {
        console.error('Failed to add customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Customers
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleClickOpen}
          sx={{
            backgroundColor: '#1F2937',
            color: 'white',
            '&:hover': {
              backgroundColor: '#374151',
            }
          }}
        >
          ADD CUSTOMER
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading customers...</Typography>
      ) : (
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
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
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