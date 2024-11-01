import React, { useState, useEffect, useContext } from 'react';
import { Button, TextField, Container, Typography, Avatar, CssBaseline, Box, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'
import api from '../../components/axiosConfig';
import { UserContext } from '../../context/UserContext';
import { LoadingContext } from '../../context/LoadingContext';
import GlobalAlert from '../../components/GlobalAlert';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [empresas, setEmpresas] = useState([]);
  const [errors, setErrors] = useState({});
  const { setUser } =   (UserContext);
  const { setIsLoading } = useContext(LoadingContext);
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!username) {
      validationErrors.username = 'El usuario es obligatorio';
    }
    if (!password) {
      validationErrors.password = 'La contraseña es obligatoria';
    }
    if (!empresaId) {
      validationErrors.empresaId = 'Debe seleccionar una empresa';
    }
    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsLoading(true);
        const response = await api.post('/account/login', { usuario_id: username, password, empresa_id: empresaId });
        const token = response.data.tokenInfo.token;
        localStorage.setItem('token', token);
        const decodedToken = jwtDecode(token); 
        const userData = { 
          ...response.data.userInfo, 
          empresa_id: empresaId, 
          roles: decodedToken.roles, 
          permissions: decodedToken.permissions,
          token  // Agregar el token a userData
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/'); // Redireccionar al dashboard
      } catch (err) {
        let response = err.response?.data ?? null;
        if(response) {
          GlobalAlert.showError('Error logging in', response.message);
          console.error('Error logging in:', response.message);
        } else {
          GlobalAlert.showError('Error logging in', err);
          console.error('Error logging in:', err);
        }

      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/account/getEmpresas');
      setEmpresas(response.data.empresas);
    } catch (error) {
      GlobalAlert.showError('Error fetching empresas', error);
      console.error('Error fetching empresas:', error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Iniciar Sesión
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Usuario"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={Boolean(errors.username)}
            helperText={errors.username}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(errors.password)}
            helperText={errors.password}
          />
          <FormControl
            fullWidth
            variant="outlined"
            margin="normal"
            required
            error={Boolean(errors.empresaId)}
          >
            <InputLabel id="empresa-label">Empresa</InputLabel>
            <Select
              labelId="empresa-label"
              id="empresa"
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              label="Empresa"
            >
              {empresas.map((em) => (
                <MenuItem key={em.empresa_id} value={em.empresa_id}>
                  {em.nombre}
                </MenuItem>
              ))}
            </Select>
            {errors.empresaId && (
              <Typography color="error">{errors.empresaId}</Typography>
            )}
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
