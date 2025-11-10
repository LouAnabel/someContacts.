// DatePicker.jsx
import React from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

const DatePicker = ({ 
    value, 
    onChange, 
    label = "select date",
    placeholder = "Select date",
    disabled = false,
    format = "DD.MM.YYYY"
}) => {
    
    const handleDateChange = (newValue) => {
        onChange(newValue);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="relative  w-[190px]">
                <label className="absolute left-2 -top-2.5 bg-white px-1 text-base text-gray-800 font-extralight z-10">
                    {label}
                </label>
                
                <MobileDatePicker
                    value={value ? dayjs(value) : null}
                    onChange={handleDateChange}
                    disabled={disabled}
                    format={format}
                    slotProps={{
                        textField: {
                            placeholder: placeholder,
                            fullWidth: true,
                            InputProps: {
                                style: {
                                    fontSize: '16px',
                                    fontWeight: 100,
                                    height: '48px',
                                    borderRadius: '0.75rem',
                                }
                            },
                            sx: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '0.50rem',
                                    backgroundColor: 'black',
                                    fontWeight: 200,
                                    '& fieldset': {
                                        borderColor: '#9ca3af',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#fca5a5',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#ef4444',
                                        borderWidth: '1px',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    fontWeight: 200,
                                    color: 'black',
                                    '&::placeholder': {
                                        color: '#d1d5db',
                                        opacity: 1,
                                    }
                                },
                            }
                        },
                        popper: {
                            sx: {
                                '& .MuiPaper-root': {
                                    borderRadius: '1rem',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                },
                                '& .MuiPickersDay-root': {
                                    fontWeight: 200,
                                    '&.Mui-selected': {
                                        backgroundColor: '#ef4444 !important',
                                        color: 'white !important',
                                        '&:hover': {
                                            backgroundColor: '#dc2626 !important',
                                        },
                                        '&:focus': {
                                            backgroundColor: '#ef4444 !important',
                                        }
                                    },
                                    '&:hover': {
                                        backgroundColor: '#fee2e2',
                                    }
                                },
                                '& .MuiPickersCalendarHeader-root': {
                                    fontWeight: 300,
                                },
                                '& .MuiPickersDay-today': {
                                    border: '1px solid #ef4444 !important',
                                    '&:not(.Mui-selected)': {
                                        backgroundColor: 'transparent',
                                    }
                                },
                                '& .MuiPickersYear-yearButton': {
                                    '&.Mui-selected': {
                                        backgroundColor: '#ef4444 !important',
                                        color: 'white !important',
                                        '&:hover': {
                                            backgroundColor: '#dc2626 !important',
                                        },
                                        '&:focus': {
                                            backgroundColor: '#ef4444 !important',
                                        }
                                    }
                                },
                                '& .MuiPickersMonth-monthButton': {
                                    '&.Mui-selected': {
                                        backgroundColor: '#ef4444 !important',
                                        color: 'white !important',
                                        '&:hover': {
                                            backgroundColor: '#dc2626 !important',
                                        },
                                        '&:focus': {
                                            backgroundColor: '#ef4444 !important',
                                        }
                                    }
                                }
                            }
                        },
                        actionBar: {
                            sx: {
                                '& .MuiButton-root': {
                                    color: '#ef4444',
                                    fontWeight: 200,
                                }
                            }
                        }
                    }}
                />
            </div>
        </LocalizationProvider>
    );
};

export default DatePicker;