pub struct Timer<'a> {
    name:&'a str
}

impl<'a> Timer<'a> {
    pub fn new(name:&'a str) -> Timer<'a> {
        Timer {name}
    }
}