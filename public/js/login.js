const login = async (email, password) => {
    try {
        const res = await axios({
            method: "POST",
            url: "http://localhost:3000/api/v1/users/login",
            data: {
                email,
                password
            }
        });
        if (res.data.status === "success") {
            alert("You are logged in succesfully");
            window.setTimeout(() => {
                location.assign("/");
            }, 1500);
        }
    } catch (error) {
        alert(error.response.data.message);
    }
};
const logout = async () => {
    const res = await axios({
        method: "GET",
        url: "http://localhost:3000/api/v1/users/logout"
    });
    if (res.data.status === "success") location.reload(true);
    // alert('Hello');
};

document.querySelector(".register").addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
});