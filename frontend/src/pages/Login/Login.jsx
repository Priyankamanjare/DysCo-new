import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import authBg from '../../assets/auth_bg.png';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { dispatch } = useAuthContext();

  const apiURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please fill in all fields");
    }
    try {
      const res = await axios.post(`${apiURL}/api/v1/user/login`, {
        email,
        password,
      });

      if (res.status === 200 && res.data.user && res.data.token) {
        dispatch({
          type: 'LOGIN',
          payload: {
            accessToken: res.data.token,
            name: res.data.user.name,
          },
        });

        localStorage.setItem("User", JSON.stringify({
          accessToken: res.data.token,
          name: res.data.user.name,
        }));

        toast.success("Successfully Logged In");

        setTimeout(() => {
          navigate("/home");
        }, 1500);
      }
    } catch (error) {
      console.log(error);
      const errorMessage = error?.response?.data?.message || error?.response?.statusText || error?.message || 'Login failed';
      toast.error(errorMessage);
    }
  };

  return (
    <div className='login__page__wrapper'>
      <div className='login__left__section' style={{ backgroundImage: `url(${authBg})` }}>
        <div className='login__hero__overlay'>
          <h1 className='hero__title'>Dys<span>Co</span></h1>
          <p className='hero__subtitle'>Empowering every mind to learn without limits.</p>
          <div className='hero__footer'>
            <p>© 2026 DysCo Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
      
      <div className='login__right__section'>
        <div className='login__form__container'>
          <div className='login__form__header'>
            <h2>Welcome Back</h2>
            <p>Please enter your details to sign in</p>
          </div>
          
          <form className='login__form__fields' onSubmit={handleLogin}>
            <div className='input__group'>
              <label>Email Address</label>
              <input
                className='login__input__new'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="name@company.com"
                required
              />
            </div>
            
            <div className='input__group'>
              <label>Password</label>
              <input
                className='login__input__new'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="login__btn__new">
              Sign In
            </button>
          </form>

          <div className='login__form__footer'>
            <p>
              Don't have an account? <Link to='/register'>Create one for free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
