import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import authBg from '../../assets/auth_bg.png';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const apiURL = import.meta.env.VITE_BACKEND_URL;

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return toast.error("Please fill in all fields");
    }
    try {
      const res = await axios.post(`${apiURL}/api/v1/user/register`, {
        name,
        email,
        password,
      });

      if (res.status === 201 && res.data.user) {
        toast.success("Successfully Registered!!");
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error?.message);
    }
  };

  return (
    <div className='register__page__wrapper'>
      <div className='register__left__section' style={{ backgroundImage: `url(${authBg})` }}>
        <div className='register__hero__overlay'>
          <h1 className='hero__title'>Dys<span>Co</span></h1>
          <p className='hero__subtitle'>Join our community and start your personalized learning journey today.</p>
          <div className='hero__footer'>
            <p>© 2026 DysCo Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
      
      <div className='register__right__section'>
        <div className='register__form__container'>
          <div className='register__form__header'>
            <h2>Create Account</h2>
            <p>Enter your details to get started</p>
          </div>
          
          <form className='register__form__fields' onSubmit={handleRegistration}>
            <div className='input__group'>
              <label>Full Name</label>
              <input
                className='register__input__new'
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="John Doe"
                required
              />
            </div>

            <div className='input__group'>
              <label>Email Address</label>
              <input
                className='register__input__new'
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
                className='register__input__new'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="register__btn__new">
              Create Account
            </button>
          </form>

          <div className='register__form__footer'>
            <p>
              Already have an account? <Link to='/'>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
